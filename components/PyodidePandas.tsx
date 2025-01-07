/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { usePyodideStore } from "@/stores/usePyodideStore";
import { usePivotStore } from "@/stores/usePivotStore";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export default function PyodidePandas({ data }: { data: any }) {
  const { pyodide } = usePyodideStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<string>("");
  const [excelData, setExcelData] = useState<Uint8Array | null>(null);
  const { rows, columns, aggregation } = usePivotStore();
  console.log(rows);

  useEffect(() => {
    const runPandasOperation = async () => {
      if (!pyodide) return;

      try {
        setLoading(true);

        pyodide.globals.set("js_data", data);

        // Example data
        const pythonCode = `
          import io
          print(js_data.to_py())
          df = pd.json_normalize(js_data.to_py())
          df = df.pivot_table(index=[${rows
            .map((row) => `'${row.name}'`)
            .toString()}], columns=[${columns
          .map((column) => `'${column.name}'`)
          .toString()}], values='${
          aggregation.name
        }', aggfunc='${aggregation.type?.toLowerCase()}')
          
          # Format numbers with Brazilian Portuguese style
          df_styled = df.style.format(formatter=lambda x: '{:,.0f}'.format(x).replace(',', '.'))
          
          # Save Excel file to bytes
          excel_buffer = io.BytesIO()
          with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
              df.to_excel(writer)
          excel_bytes = excel_buffer.getvalue()
          
          # Convert results to HTML for display
          result_html = f"""
          {df_styled.to_html()}
          """
          [result_html, excel_bytes]
        `;

        const [htmlResult, excelBytes] = await pyodide.runPythonAsync(
          pythonCode
        );
        setResult(htmlResult);
        setExcelData(new Uint8Array(excelBytes));
      } catch (err) {
        console.error("Error running Pandas operation: " + err);
      } finally {
        setLoading(false);
      }
    };

    runPandasOperation();
  }, [data, pyodide, rows, columns, aggregation]);

  const handleDownload = () => {
    if (excelData) {
      const blob = new Blob([excelData.buffer], {
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
    }
  };

  return (
    <>
      {loading && <div>Loading...</div>}
      {result && (
        <>
          <button
            onClick={handleDownload}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Download Excel
          </button>
          <div
            className="flex p-4 w-full h-full rounded-md border border-separate overflow-y-auto overflow-x-auto [&_table]:border [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:px-2 [&_td]:text-center [&_th]:text-center"
            dangerouslySetInnerHTML={{ __html: result.replace(/nan/g, "") }}
          />
        </>
      )}
    </>
  );
}
