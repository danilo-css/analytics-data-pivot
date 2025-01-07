/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import FileManager from "./FileManager";
import { useFileStore } from "@/stores/useFileStore";
import { useDuckDBStore } from "@/stores/useDuckDBStore";
import InitWasm from "./InitWasm";
import { usePyodideStore } from "@/stores/usePyodideStore";
import { useTableStore } from "@/stores/useTableStore";
import FieldSelection from "./FieldSelection";
import PivotFields from "./PivotFields";
import { Play } from "lucide-react";
import { usePivotStore } from "@/stores/usePivotStore";
import { getTypeForColumn } from "@/lib/utils";
import PyodidePandas from "./PyodidePandas";
import { Button } from "./ui/button";

export default function Main() {
  const { db, runQuery } = useDuckDBStore();
  const { pyodide } = usePyodideStore();
  const { files } = useFileStore();
  const { queryFields, setQueryFieldsFromFiles } = useTableStore();
  const { rows, columns, aggregation } = usePivotStore();

  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQueryRunning, setIsQueryRunning] = useState(false);

  useEffect(() => {
    if (!files || !db) return;

    setLoading(true);
    setError(null);

    try {
      setQueryFieldsFromFiles(files, db, runQuery);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(
        "Error processing file. Please check the console for more details."
      );
    } finally {
      setLoading(false);
    }
  }, [files]);

  const sqlQuery = useMemo(() => {
    if (files.length === 0) {
      return null;
    } else if (files.length === 1 && aggregation.name) {
      const row_list = rows.map((row) => row.name);
      const column_list = columns.map((column) => column.name);
      const all_fields = [...new Set([...row_list, ...column_list])];
      const all_fields_string = all_fields
        .map(
          (field) =>
            `CAST("${field}" AS ${
              getTypeForColumn(queryFields, files[0].name, field) === "Utf8"
                ? "VARCHAR"
                : "FLOAT"
            }) AS "${field}"`
        )
        .join(", ");
      const all_fields_string_groupby = all_fields
        .map(
          (field) =>
            `CAST("${field}" AS ${
              getTypeForColumn(queryFields, files[0].name, field) === "Utf8"
                ? "VARCHAR"
                : "FLOAT"
            })`
        )
        .join(", ");

      return `
          SELECT ${all_fields_string}, ${aggregation.type}(CAST("${
        aggregation.name
      }" AS ${
        getTypeForColumn(queryFields, files[0].name, aggregation.name) ===
        "Utf8"
          ? "VARCHAR"
          : "FLOAT"
      })) AS "${aggregation.name}"
          FROM '${files[0].name}' 
          GROUP BY ${all_fields_string_groupby}
          `;
    }
    return null;
  }, [files, rows, columns, aggregation, queryFields]);

  const handleRunQuery = async () => {
    if (!sqlQuery || !db || isQueryRunning) return;

    try {
      setIsQueryRunning(true);
      const result = await runQuery(db, sqlQuery);
      setData(JSON.parse(result.toString()));
    } catch (error) {
      console.error("Query execution error:", error);
    } finally {
      setIsQueryRunning(false);
    }
  };

  return (
    <main className="relative md:absolute flex flex-col md:flex-row items-center md:items-start justify-center h-full w-full gap-1 py-1 px-1">
      <section className="relative md:w-fit w-full md:h-full flex-shrink-0">
        <div className="flex flex-col items-center border rounded-lg py-4 px-4">
          <InitWasm />
          {pyodide && db && <FileManager />}
          {loading && <div>Loading...</div>}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {files.length > 0 && db && <FieldSelection />}
      </section>
      <section className="relative w-full md:h-full items-center justify-center overflow-hidden">
        <div className="flex flex-col gap-1 h-full w-full">
          <PivotFields />
          <Button
            className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
            disabled={isQueryRunning}
            onClick={handleRunQuery}
          >
            <Play size={20} />
            <p>{isQueryRunning ? "Running..." : "Run query"}</p>
          </Button>
          <div className="overflow-x-auto">
            {data && pyodide && <PyodidePandas data={data} />}
          </div>
        </div>
      </section>
    </main>
  );
}
