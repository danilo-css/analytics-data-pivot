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
import { Copy, Play, Loader2 } from "lucide-react";
import { usePivotStore } from "@/stores/usePivotStore";
import { getTypeForColumn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useExcelStore } from "@/stores/useExcelStore";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { useRelationalStore } from "@/stores/useRelationalStore";
import RelationalStructure from "./RelationalStructure";
import { FaLanguage } from "react-icons/fa6";
import { Table as Arrow } from "apache-arrow";
import AnalyticsDataLogo from "./AnalyticsDataLogo";
import AnalyticsDataInfo from "./AnalyticsDataInfo";
import { useToast } from "@/hooks/use-toast";
import { format } from "sql-formatter";

export default function Main() {
  const { toast } = useToast();
  const { db, runQuery } = useDuckDBStore();
  const { pyodide } = usePyodideStore();
  const { files } = useFileStore();
  const { queryFields, setQueryFieldsFromFiles } = useTableStore();
  const { rows, columns, aggregation, filters } = usePivotStore();
  const { relationships } = useRelationalStore();
  const { result, setResult } = useExcelStore();
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
    if (files.length > 0) {
      // If current selection is no longer in files list, select first available file
      if (!files.some((file) => file.name === selectedPreviewFile)) {
        setSelectedPreviewFile(files[0].name);
      }
    } else {
      // Clear selection when no files remain
      setSelectedPreviewFile("");
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
    const generateQuery = () => {
      if (files.length === 0) {
        return null;
      } else if (
        files.length === 1 &&
        aggregation.name &&
        (rows.length > 0 || columns.length > 0)
      ) {
        const generateFieldExpression = (
          field: (typeof rows)[0] | (typeof columns)[0]
        ) => {
          if (field.dateExtract) {
            const originalField = field.name
              .replace(`${field.dateExtract}(`, "")
              .replace(")", "");
            const extractExpr = `EXTRACT(${field.dateExtract} FROM CAST("${originalField}" AS DATE))`;
            return field.dateExtract === "MONTH"
              ? `LPAD(CAST(${extractExpr} AS VARCHAR), 2, '0') AS "${field.name}"`
              : field.dateExtract === "QUARTER"
              ? `CONCAT('Q', CAST(${extractExpr} AS VARCHAR)) AS "${field.name}"`
              : `CAST(${extractExpr} AS VARCHAR) AS "${field.name}"`;
          }
          return `CAST("${field.name}" AS ${
            getTypeForColumn(queryFields, field.table, field.name) === "Utf8"
              ? "VARCHAR"
              : "DOUBLE"
          }) AS "${field.name}"`;
        };

        const generateGroupByExpression = (
          field: (typeof rows)[0] | (typeof columns)[0]
        ) => {
          if (field.dateExtract) {
            const originalField = field.name
              .replace(`${field.dateExtract}(`, "")
              .replace(")", "");
            return `EXTRACT(${field.dateExtract} FROM CAST("${originalField}" AS DATE))`;
          }
          return `CAST("${field.name}" AS ${
            getTypeForColumn(queryFields, field.table, field.name) === "Utf8"
              ? "VARCHAR"
              : "DOUBLE"
          })`;
        };

        const all_fields = [...rows, ...columns];
        const all_fields_string = all_fields
          .map((field) => generateFieldExpression(field))
          .join(", ");

        const all_fields_string_groupby = all_fields
          .map((field) => generateGroupByExpression(field))
          .join(", ");

        return `
            SELECT ${all_fields_string}, ${aggregation.type}(CAST("${
          aggregation.name
        }" AS ${
          getTypeForColumn(queryFields, files[0].name, aggregation.name) ===
          "Utf8"
            ? "VARCHAR"
            : "DOUBLE"
        })) AS "${aggregation.name}"
            FROM '${files[0].name}' 
            ${
              filters.length > 0
                ? `WHERE ${filters
                    .map((filter) => {
                      if (filter.dateExtract) {
                        const originalField = filter.field
                          .replace(`${filter.dateExtract}(`, "")
                          .replace(")", "");
                        const extractExpr = `EXTRACT(${filter.dateExtract} FROM CAST("${originalField}" AS DATE))`;
                        const filterExpr =
                          filter.dateExtract === "MONTH"
                            ? `LPAD(CAST(${extractExpr} AS VARCHAR), 2, '0')`
                            : filter.dateExtract === "QUARTER"
                            ? `CONCAT('Q', CAST(${extractExpr} AS VARCHAR))`
                            : `CAST(${extractExpr} AS VARCHAR)`;
                        return `${filterExpr} IN (${filter.values
                          .map((value) => `'${value}'`)
                          .join(", ")})`;
                      }
                      return `"${filter.field}" IN (${filter.values
                        .map((value) => `'${value}'`)
                        .join(", ")})`;
                    })
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
        const generateFieldExpression = (
          field: (typeof rows)[0] | (typeof columns)[0]
        ) => {
          if (field.dateExtract) {
            const originalField = field.name
              .replace(`${field.dateExtract}(`, "")
              .replace(")", "");
            const tablePrefix = `TABLE${files.findIndex(
              (file) => file.name === field.table
            )}`;
            const extractExpr = `EXTRACT(${field.dateExtract} FROM CAST(${tablePrefix}."${originalField}" AS DATE))`;
            return field.dateExtract === "MONTH"
              ? `LPAD(CAST(${extractExpr} AS VARCHAR), 2, '0') AS "${field.name}"`
              : field.dateExtract === "QUARTER"
              ? `CONCAT('Q', CAST(${extractExpr} AS VARCHAR)) AS "${field.name}"`
              : `CAST(${extractExpr} AS VARCHAR) AS "${field.name}"`;
          }
          return `CAST(TABLE${files.findIndex(
            (file) => file.name === field.table
          )}."${field.name}" AS ${
            getTypeForColumn(queryFields, field.table, field.name) === "Utf8"
              ? "VARCHAR"
              : "DOUBLE"
          }) AS "${field.name}"`;
        };

        const generateGroupByExpression = (
          field: (typeof rows)[0] | (typeof columns)[0]
        ) => {
          if (field.dateExtract) {
            const originalField = field.name
              .replace(`${field.dateExtract}(`, "")
              .replace(")", "");
            return `EXTRACT(${
              field.dateExtract
            } FROM CAST(TABLE${files.findIndex(
              (file) => file.name === field.table
            )}."${originalField}" AS DATE))`;
          }
          return `CAST(TABLE${files.findIndex(
            (file) => file.name === field.table
          )}."${field.name}" AS ${
            getTypeForColumn(queryFields, field.table, field.name) === "Utf8"
              ? "VARCHAR"
              : "DOUBLE"
          })`;
        };

        const fields = [...rows, ...columns];
        const uniqueFields = [
          ...new Set(fields.map((field) => JSON.stringify(field))),
        ].map((str) => JSON.parse(str));

        const all_fields_string = uniqueFields.map(generateFieldExpression);
        const all_fields_string_groupby = uniqueFields
          .map(generateGroupByExpression)
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
          const castType =
            isPrimaryFloat || isForeignFloat ? "DOUBLE" : "VARCHAR";

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
            : "DOUBLE"
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
                    .map((filter) => {
                      const tablePrefix = `TABLE${files.findIndex(
                        (file) => file.name === filter.table
                      )}`;
                      if (filter.dateExtract) {
                        // Extract original field name from the date extract expression
                        const originalField = filter.field
                          .replace(`${filter.dateExtract}(`, "")
                          .replace(")", "");
                        const extractExpr = `EXTRACT(${filter.dateExtract} FROM CAST(${tablePrefix}."${originalField}" AS DATE))`;
                        const filterExpr =
                          filter.dateExtract === "MONTH"
                            ? `LPAD(CAST(${extractExpr} AS VARCHAR), 2, '0')`
                            : filter.dateExtract === "QUARTER"
                            ? `CONCAT('Q', CAST(${extractExpr} AS VARCHAR))`
                            : `CAST(${extractExpr} AS VARCHAR)`;
                        return `${filterExpr} IN (${filter.values
                          .map((value) => `'${value}'`)
                          .join(", ")})`;
                      }
                      // For non-date fields, use the original field name
                      return `${tablePrefix}."${
                        filter.field
                      }" IN (${filter.values
                        .map((value) => `'${value}'`)
                        .join(", ")})`;
                    })
                    .join(" AND ")}`
                : ""
            }
            GROUP BY ${all_fields_string_groupby}
            `;
      } else {
        return `SELECT * FROM '${selectedPreviewFile}' LIMIT ${previewRows}`;
      }
    };

    const rawQuery = generateQuery();
    return rawQuery ? format(rawQuery, { language: "duckdb" }) : null;
  })();

  const handleRunQuery = async () => {
    if (!sqlQuery || !db || isQueryRunning) return;

    try {
      setIsQueryRunning(true);
      const result: Arrow = await runQuery(db, sqlQuery);

      // Convert Arrow table to array and clean string values
      const cleanedData = result.toArray().map((row) => {
        const cleanedRow: any = {};
        for (const [key, value] of Object.entries(row)) {
          cleanedRow[key] =
            typeof value === "string" ? value.replace(/"/g, "") : value;
        }
        return cleanedRow;
      });
      handleRunPyodide(cleanedData);
    } catch (error) {
      toast({
        title: "Query Execution Error",
        description:
          error instanceof Error
            ? error.message
            : "An unknown error occurred while running the query",
        variant: "destructive",
      });
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
      const blob = new Blob([Buffer.from(excelBytes)], {
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
        from openpyxl.styles import numbers
        import openpyxl
        df = pd.json_normalize(js_data.to_py())

        if "__index_level_0__" in df.columns:
            df = df.drop(columns=["__index_level_0__"])

        if not preview:
            df = ${getPivotCode()}

        def format_excel_sheet(writer, df, sheet_name='Pivot Table'):
            df.to_excel(writer, sheet_name=sheet_name)
            worksheet = writer.sheets[sheet_name]
            
            # Get the dimensions of the data
            all_rows = list(worksheet.rows)
            if not all_rows:
                return
                
            for col_idx, col in enumerate(worksheet.iter_cols(min_col=1, max_col=len(all_rows[0]), min_row=1), 1):
                max_length = 0
                column_letter = None
                
                for cell in col:
                    if cell.value:
                        try:
                            max_length = max(max_length, len(str(cell.value)))
                            if isinstance(cell.value, (int, float)):
                                cell.number_format = '#,##0'
                            # Enable text wrapping and center alignment for column headers
                            if cell.row <= df.columns.nlevels + 1:
                                cell.alignment = openpyxl.styles.Alignment(wrap_text=True, horizontal='center', vertical='center')  
                        except:
                            pass
                    # Get column letter from first non-merged cell
                    if not column_letter and hasattr(cell, 'column_letter'):
                        column_letter = cell.column_letter
                            
                # Set column width with a minimum of 8 and maximum of 50
                if column_letter:
                    adjusted_width = min(max(max_length + 2, 8), 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
                    
        # Save Excel with formatting
        with pd.ExcelWriter('/excel_output.xlsx', engine='openpyxl') as writer:
            try:
                format_excel_sheet(writer, df)
            except Exception as e:
                print(f"Error formatting main sheet: {str(e)}")
                df.to_excel(writer, sheet_name='Pivot Table')
                
            if not preview and len(js_filters.to_py()) > 0:
                try:
                    filters_data = js_filters.to_py()
                    filters_df = pd.DataFrame([(f['table'], f['field'], ', '.join(f['values'])) 
                                            for f in filters_data], 
                                            columns=['Table', 'Field', 'Values'])
                    format_excel_sheet(writer, filters_df, 'Filters')
                except Exception as e:
                    print(f"Error formatting filters sheet: {str(e)}")

        # Generate HTML
        if use_format:
            df_styled = df.style.format(formatter=lambda x: '{:,.0f}'.format(float(x)).replace(',', '.') if pd.notnull(x) and isinstance(x, (int, float)) else x, na_rep='')
        else:
            df_styled = df.style.format(formatter=lambda x: '{:,.0f}'.format(float(x)) if pd.notnull(x) and isinstance(x, (int, float)) else x, na_rep='')
            
        html_content = df_styled.to_html()
        del df_styled

        html_content
      `;

      const htmlResult = await pyodide.runPythonAsync(pythonCode);
      resultContainerRef.current.innerHTML = htmlResult;
      setResult(true); // Just set a flag that we have data available
    } catch (err) {
      console.error("Error running Pandas operation: " + err);
      setResult(false);
    }
  };

  const getPivotCode = () => {
    if (
      !preview &&
      aggregation.name &&
      (rows.length > 0 || columns.length > 0)
    ) {
      return `df.pivot_table(index=[${rows
        .map((row) => `'${row.name}'`)
        .toString()}], 
                  columns=[${columns
                    .map((column) => `'${column.name}'`)
                    .toString()}], 
                  values='${aggregation.name}', 
                  aggfunc='${
                    aggregation.type?.toLowerCase() === "avg"
                      ? "mean"
                      : aggregation.type?.toLowerCase()
                  }')`;
    }
    return null;
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
      <section className="relative md:w-fit w-full md:h-full flex flex-col flex-shrink-0 gap-1 px-1">
        <AnalyticsDataLogo />
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
        <AnalyticsDataInfo />
      </section>
      {pyodide && db && (
        <section className="relative w-full md:h-full items-center justify-center overflow-hidden">
          <div className="flex flex-col gap-1 h-full w-full">
            {(files.length <= 1 || hasRelationships) && (
              <>
                <PivotFields />
                <div className="flex flex-col gap-1">
                  <div className="flex flex-row items-center justify-center lg:justify-start flex-wrap gap-1">
                    <Button
                      className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
                      disabled={isQueryRunning}
                      onClick={() => {
                        handleRunQuery();
                      }}
                    >
                      {isQueryRunning ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Play size={20} />
                      )}
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
                      <>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(sqlQuery);
                            toast({
                              title: "SQL copied to clipboard",
                              description:
                                "The SQL query defined by the current parameters has been copied to your clipboard.",
                            });
                          }}
                          className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
                        >
                          <Copy size={20} />
                          <p>Copy SQL</p>
                        </Button>
                        {!preview && getPivotCode() && (
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(getPivotCode()!);
                              toast({
                                title: "Pandas pivot code copied to clipboard",
                                description:
                                  "The pandas pivot table code has been copied to your clipboard.",
                              });
                            }}
                            className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
                          >
                            <Copy size={20} />
                            <p>Copy Pandas Pivot Code</p>
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      onClick={() => {
                        setUseFormat(!useFormat);
                        toast({
                          title: useFormat
                            ? "Using American number format"
                            : "Using European number format",
                          description: useFormat
                            ? "Click again to use European number format."
                            : "Click again to use American number format.",
                        });
                      }}
                      className="flex flex-row gap-1 py-1 px-2 rounded-md w-fit"
                    >
                      <FaLanguage size={20} />
                      <p>
                        {useFormat
                          ? "Use American number format"
                          : "Use European number format"}
                      </p>
                    </Button>
                  </div>
                  {preview && files.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2">
                      <span>
                        Not enough pivot parameters selected. Click &quot;Run
                        query&quot; to preview top
                      </span>
                      <select
                        value={previewRows}
                        onChange={(e) =>
                          handlePreviewRowsChange(e.target.value)
                        }
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
                      </select>
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <div
                    className="flex p-4 w-full h-full rounded-md border-separate overflow-y-auto overflow-x-auto [&_table]:border [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:px-2 [&_td]:text-center [&_th]:text-center"
                    ref={resultContainerRef}
                  ></div>
                </div>
              </>
            )}
            {files.length > 1 && <RelationalStructure />}
          </div>
        </section>
      )}
    </main>
  );
}
