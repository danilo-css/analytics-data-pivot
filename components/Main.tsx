/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
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
import { useExcelStore } from "@/stores/useExcelStore";
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
  const { setResult } = useExcelStore();
  const { relationships } = useRelationalStore();
  const { result } = useExcelStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [useFormat, setUseFormat] = useState(true);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(false);
  const PREVIEW_ROW_OPTIONS = [10, 50, 100, 1000] as const;
  const [previewRows, setPreviewRows] =
    useState<(typeof PREVIEW_ROW_OPTIONS)[number]>(10);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<string>("");

  const handlePreviewRowsChange = (value: string) => {
    setPreviewRows(Number(value) as (typeof PREVIEW_ROW_OPTIONS)[number]);
  };

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

  useEffect(() => {
    if (files.length > 0 && !selectedPreviewFile) {
      setSelectedPreviewFile(files[0].name);
    }
  }, [files, selectedPreviewFile]);

  useEffect(() => {
    const shouldShowPreview = !(
      files.length >= 1 &&
      aggregation.name &&
      (rows.length > 0 || columns.length > 0)
    );
    setPreview(shouldShowPreview);
  }, [files.length, aggregation.name, rows.length, columns.length]);

  const sqlQuery = (() => {
    if (files.length === 0) {
      return null;
    } else if (
      files.length === 1 &&
      aggregation.name &&
      (rows.length > 0 || columns.length > 0)
    ) {
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
    } else if (
      files.length > 1 &&
      aggregation.name &&
      (rows.length > 0 || columns.length > 0)
    ) {
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

      const relationship_list = relationships.map((relationship) => {
        const isPrimaryFloat =
          getTypeForColumn(
            queryFields,
            relationship.primary_table,
            relationship.primary_key
          ) !== "Utf8";
        const isForeignFloat =
          getTypeForColumn(
            queryFields,
            relationship.foreign_table,
            relationship.foreign_key
          ) !== "Utf8";
        const castType = isPrimaryFloat || isForeignFloat ? "FLOAT" : "VARCHAR";

        return `CAST(TABLE${files.findIndex(
          (file) => file.name === relationship.primary_table
        )}."${
          relationship.primary_key
        }" AS ${castType}) = CAST(TABLE${files.findIndex(
          (file) => file.name === relationship.foreign_table
        )}."${relationship.foreign_key}" AS ${castType})`;
      });

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
    } else {
      return `SELECT * FROM '${selectedPreviewFile}' LIMIT ${previewRows}`;
    }
  })();

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

  const handleDownload = () => {
    if (!pyodide) {
      console.error("Pyodide is not initialized");
      return;
    }

    try {
      const excelBytes = pyodide.FS.readFile("/excel_output.xlsx");
      const blob = new Blob([excelBytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pivot_table.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  const handleRunPyodide = async (queryData: any) => {
    if (!pyodide || !resultContainerRef.current) return;

    try {
      pyodide.globals.set("js_data", queryData);
      pyodide.globals.set("js_filters", filters);
      pyodide.globals.set("use_format", useFormat);
      pyodide.globals.set("preview", preview);

      const pythonCode = `
        import io
        df = pd.json_normalize(js_data.to_py())

        if "__index_level_0__" in df.columns:
          df = df.drop(columns=["__index_level_0__"])

        if not preview:
          df = df.pivot_table(index=[${rows
            .map((row) => `'${row.name}'`)
            .toString()}], columns=[${columns
        .map((column) => `'${column.name}'`)
        .toString()}], values='${aggregation.name}', aggfunc='${
        aggregation.type?.toLowerCase() === "avg"
          ? "mean"
          : aggregation.type?.toLowerCase()
      }')
        
        # Check table dimensions
        total_cells = df.shape[0] * df.shape[1]
        if total_cells >= 50000:
            html_content = "Table is too big. Download Excel instead."
        else:
            # Save the raw data to Excel first
            # Create filters DataFrame
            if not preview:
              filters_data = js_filters.to_py()
              filters_df = pd.DataFrame([(f['table'], f['field'], ', '.join(f['values'])) for f in filters_data], 
                                      columns=['Table', 'Field', 'Values'])
            
            with pd.ExcelWriter('/excel_output.xlsx', engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Pivot Table')
                if not preview:
                  filters_df.to_excel(writer, sheet_name='Filters', index=False)

            # Generate HTML separately to avoid keeping both in memory
            if use_format:
                df_styled = df.style.format(formatter=lambda x: '{:,.0f}'.format(float(x)).replace(',', '.') if pd.notnull(x) and isinstance(x, (int, float)) else x)
            else:
                df_styled = df.style.format(formatter=lambda x: '{:,.0f}'.format(float(x)) if pd.notnull(x) and isinstance(x, (int, float)) else x)
                
            html_content = df_styled.to_html()
            del df_styled  # Explicitly delete the styled DataFrame

        # Always save Excel file regardless of size
        with pd.ExcelWriter('/excel_output.xlsx', engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Pivot Table')
            if not preview:
              filters_df.to_excel(writer, sheet_name='Filters', index=False)

        html_content      `;

      const htmlResult = await pyodide.runPythonAsync(pythonCode);
      resultContainerRef.current.innerHTML = htmlResult;
      setResult(true); // Just set a flag that we have data available
    } catch (err) {
      console.error("Error running Pandas operation: " + err);
      setResult(false);
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
              <div className="flex flex-col justify-between gap-1">
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
                  <Button
                    onClick={() => {
                      setUseFormat(!useFormat);
                    }}
                    className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
                  >
                    <FaLanguage size={20} />
                    <p>
                      {useFormat
                        ? "Use American Format"
                        : "Use European Format"}
                    </p>
                  </Button>
                </div>
                {preview && files.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span>
                      Not enough pivot parameters selected. Click &quot;Run
                      query&quot; to preview top
                    </span>
                    <select
                      value={previewRows}
                      onChange={(e) => handlePreviewRowsChange(e.target.value)}
                      className="w-24 px-2 py-1 border rounded bg-black cursor-pointer"
                    >
                      {PREVIEW_ROW_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="cursor-pointer"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                    <span>rows of</span>
                    <select
                      value={selectedPreviewFile}
                      onChange={(e) => setSelectedPreviewFile(e.target.value)}
                      className="px-2 py-1 border rounded bg-black cursor-pointer max-w-[300px] text-ellipsis"
                    >
                      {files.map((file) => (
                        <option
                          key={file.name}
                          value={file.name}
                          className="cursor-pointer overflow-hidden text-ellipsis"
                        >
                          {file.name}
                        </option>
                      ))}
                    </select>{" "}
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <div
                  className="flex p-4 w-full h-full rounded-md border border-separate overflow-y-auto overflow-x-auto [&_table]:border [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:px-2 [&_td]:text-center [&_th]:text-center"
                  ref={resultContainerRef}
                ></div>
              </div>
            </>
          )}
          {files.length > 1 && <RelationalStructure />}
        </div>
      </section>
    </main>
  );
}
