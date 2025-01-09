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
import PyodidePandas from "./PyodidePandas";
import { Button } from "./ui/button";
import { useExcelStore } from "@/stores/useExcelStore";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";

export default function Main() {
  const { db, runQuery } = useDuckDBStore();
  const { pyodide } = usePyodideStore();
  const { files } = useFileStore();
  const { queryFields, setQueryFieldsFromFiles } = useTableStore();
  const { rows, columns, aggregation, filters } = usePivotStore();
  const { result, handleDownload, setResult, setExcelData } = useExcelStore();
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
    }
    return null;
  }, [files, rows, columns, aggregation, queryFields, filters]);

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
      console.log(filters);

      const pythonCode = `
        import io
        print(js_data.to_py())
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
        
        # Format numbers with Brazilian Portuguese style
        df_styled = df.style.format(formatter=lambda x: '{:,.0f}'.format(x).replace(',', '.'))
        
        # Create filters DataFrame
        filters_data = js_filters.to_py()
        filters_df = pd.DataFrame([(f['table'], f['field'], ', '.join(f['values'])) for f in filters_data], 
                                columns=['Table', 'Field', 'Values'])
        
        # Save Excel file to bytes
        excel_buffer = io.BytesIO()
        with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Pivot Table')
            filters_df.to_excel(writer, sheet_name='Filters', index=False)
        excel_bytes = excel_buffer.getvalue()
        
        # Convert results to HTML for display
        result_html = f"""
        {df_styled.to_html()}
        """
        [result_html, excel_bytes]
      `;

      const [htmlResult, excelBytes] = await pyodide.runPythonAsync(pythonCode);
      setResult(htmlResult);
      setExcelData(new Uint8Array(excelBytes));
    } catch (err) {
      console.error("Error running Pandas operation: " + err);
    }
  };

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
            {result && (
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
          </div>
          <div className="overflow-x-auto">
            {result && pyodide && <PyodidePandas />}
          </div>
        </div>
      </section>
    </main>
  );
}
