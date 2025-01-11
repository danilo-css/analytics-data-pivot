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
import { Copy, Play } from "lucide-react";
import { usePivotStore } from "@/stores/usePivotStore";
import { getTypeForColumn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { useRelationalStore } from "@/stores/useRelationalStore";
import RelationalStructure from "./RelationalStructure";
import { FaLanguage } from "react-icons/fa6";

export default function Main() {
  const { db, runQuery } = useDuckDBStore();
  const { pyodide } = usePyodideStore();
  const { files } = useFileStore();
  const { queryFields, setQueryFieldsFromFiles } = useTableStore();
  const { rows, columns, aggregation, filters } = usePivotStore();
  const { relationships } = useRelationalStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [useFormat, setUseFormat] = useState(true);
  const [resultHtml, setResultHtml] = useState<string | null>(null);

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
  }, [files, db, runQuery, setQueryFieldsFromFiles]);

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
          ${
            filters.length > 0
              ? `WHERE ${filters
                  .map(
                    (filter) =>
                      `"${filter.field}" IN (${filter.values
                        .map((value) => `'${value}'`)
                        .join(", ")})`
                  )
                  .join(" AND ")}`
              : ""
          }
          GROUP BY ${all_fields_string_groupby}
          `;
    } else if (files.length > 1 && aggregation.name) {
      const fields = [...rows, ...columns];

      const uniqueFields = [
        ...new Set(fields.map((field) => JSON.stringify(field))),
      ].map((str) => JSON.parse(str));

      const all_fields_string = uniqueFields.map(
        (field) =>
          `CAST(TABLE${files.findIndex((file) => file.name === field.table)}."${
            field.name
          }" AS ${
            getTypeForColumn(queryFields, field.table, field.name) === "Utf8"
              ? "VARCHAR"
              : "FLOAT"
          }) AS "${field.name}"`
      );

      const all_fields_string_groupby = uniqueFields
        .map(
          (field) =>
            `CAST(TABLE${files.findIndex(
              (file) => file.name === field.table
            )}."${field.name}" AS ${
              getTypeForColumn(queryFields, field.table, field.name) === "Utf8"
                ? "VARCHAR"
                : "FLOAT"
            })`
        )
        .join(", ");

      const relationship_list = relationships.map(
        (relationship) =>
          `CAST(TABLE${files.findIndex(
            (file) => file.name === relationship.primary_table
          )}."${relationship.primary_key}" AS ${
            getTypeForColumn(
              queryFields,
              relationship.primary_table,
              relationship.primary_key
            ) === "Utf8"
              ? "VARCHAR"
              : "FLOAT"
          }) = CAST(TABLE${files.findIndex(
            (file) => file.name === relationship.foreign_table
          )}."${relationship.foreign_key}" AS ${
            getTypeForColumn(
              queryFields,
              relationship.foreign_table,
              relationship.foreign_key
            ) === "Utf8"
              ? "VARCHAR"
              : "FLOAT"
          })`
      );

      return `
          SELECT ${all_fields_string}, ${aggregation.type}(CAST("${
        aggregation.name
      }" AS ${
        getTypeForColumn(
          queryFields,
          files[files.findIndex((file) => file.name === aggregation.table)]
            .name,
          aggregation.name
        ) === "Utf8"
          ? "VARCHAR"
          : "FLOAT"
      })) AS "${aggregation.name}"
          FROM '${files[0].name}' AS TABLE0
          JOIN ${files
            .slice(1)
            .map(
              (file) =>
                `'${file.name}' AS TABLE${files.findIndex(
                  (innerFile) => file.name === innerFile.name
                )} ON ${relationship_list
                  .filter((relationship) =>
                    relationship.includes(
                      `TABLE${files.findIndex(
                        (innerFile2) => file.name === innerFile2.name
                      )}`
                    )
                  )
                  .join(" AND ")}`
            )
            .join(" JOIN ")}
          ${
            filters.length > 0
              ? `WHERE ${filters
                  .map(
                    (filter) =>
                      `TABLE${files.findIndex(
                        (file) => file.name === filter.table
                      )}."${filter.field}" IN (${filter.values
                        .map((value) => `'${value}'`)
                        .join(", ")})`
                  )
                  .join(" AND ")}`
              : ""
          }
          GROUP BY ${all_fields_string_groupby}
          `;
    }
    return null;
  }, [files, rows, columns, aggregation, queryFields, filters, relationships]);

  console.log(sqlQuery);

  const handleRunQuery = async () => {
    if (!sqlQuery || !db || isQueryRunning) return;

    try {
      setIsQueryRunning(true);
      const result = await runQuery(db, sqlQuery);
      handleRunPyodide(JSON.parse(result.toString()));
    } catch (error) {
      console.error("Query execution error:", error);
    } finally {
      setIsQueryRunning(false);
    }
  };

  const handleRunPyodide = async (queryData: any) => {
    if (!pyodide) return;

    try {
      pyodide.globals.set("js_data", queryData);
      pyodide.globals.set("js_filters", filters);
      pyodide.globals.set("use__format", useFormat);

      const pythonCode = `
        import io
        df = pd.json_normalize(js_data.to_py())
        df = df.pivot_table(index=[${rows
          .map((row) => `'${row.name}'`)
          .toString()}], columns=[${columns
        .map((column) => `'${column.name}'`)
        .toString()}], values='${aggregation.name}', aggfunc='${
        aggregation.type?.toLowerCase() === "avg"
          ? "mean"
          : aggregation.type?.toLowerCase()
      }')
        
        # Conditional formatting based on user preference
        if use__format:
            df_styled = df.style.format(formatter=lambda x: '{:,.0f}'.format(x).replace(',', '.'))
        else:
            df_styled = df.style.format(formatter=lambda x: '{:,.0f}'.format(x))
        
        # Create filters DataFrame
        filters_data = js_filters.to_py()
        filters_df = pd.DataFrame([(f['table'], f['field'], ', '.join(f['values'])) for f in filters_data], 
                                columns=['Table', 'Field', 'Values'])
        
        # Save Excel file
        df.to_excel('/tmp/pivot_table.xlsx', sheet_name='Pivot Table')
        filters_df.to_excel('/tmp/pivot_table.xlsx', sheet_name='Filters', index=False, mode='a')
        
        # Convert results to HTML for display
        result_html = df_styled.to_html()
        result_html
      `;

      const htmlResult = await pyodide.runPythonAsync(pythonCode);
      setResultHtml(htmlResult);
    } catch (err) {
      console.error("Error running Pandas operation: " + err);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("/tmp/pivot_table.xlsx");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pivot_table.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  const hasRelationships = useMemo(
    () =>
      files.every((file) =>
        relationships.some(
          (rel) =>
            rel.primary_table === file.name || rel.foreign_table === file.name
        )
      ),
    [files, relationships]
  );

  return (
    <main className="relative md:absolute flex flex-col md:flex-row items-center md:items-start justify-center h-full w-full gap-1 py-1 px-1">
      <section className="relative md:w-fit w-full md:h-full flex flex-col flex-shrink-0 gap-1">
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
          {(files.length <= 1 || hasRelationships) && (
            <>
              <PivotFields />
              <div className="flex flex-row gap-1">
                <Button
                  className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
                  disabled={isQueryRunning}
                  onClick={() => {
                    handleRunQuery();
                  }}
                >
                  <Play size={20} />
                  <p>{isQueryRunning ? "Running..." : "Run query"}</p>
                </Button>
                {resultHtml && (
                  <Button
                    onClick={handleDownload}
                    className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
                  >
                    <PiMicrosoftExcelLogoFill size={20} />
                    <p>Download Excel</p>
                  </Button>
                )}
                {sqlQuery && (
                  <Button
                    onClick={() => navigator.clipboard.writeText(sqlQuery)}
                    className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
                  >
                    <Copy size={20} />
                    <p>Copy SQL</p>
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setUseFormat(!useFormat);
                  }}
                  className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
                >
                  <FaLanguage size={20} />
                  <p>
                    {useFormat ? "Use American Format" : "Use European Format"}
                  </p>
                </Button>
              </div>
              <div className="overflow-x-auto">
                {resultHtml && (
                  <div
                    className="flex p-4 w-full h-full rounded-md border border-separate overflow-y-auto overflow-x-auto [&_table]:border [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:px-2 [&_td]:text-center [&_th]:text-center"
                    dangerouslySetInnerHTML={{
                      __html: resultHtml.replace(/nan/g, ""),
                    }}
                  />
                )}
              </div>
            </>
          )}
          {files.length > 1 && <RelationalStructure />}
        </div>
      </section>
    </main>
  );
}
