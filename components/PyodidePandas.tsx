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
          print(js_data.to_py())
          df = pd.json_normalize(js_data.to_py())
          df = df.pivot_table(index=[${rows
            .map((row) => `'${row.name}'`)
            .toString()}], columns=[${columns
          .map((column) => `'${column.name}'`)
          .toString()}], values='${
          aggregation.name
        }', aggfunc='${aggregation.type?.toLowerCase()}')          
          # Convert results to HTML for display
          result_html = f"""
          {df.to_html()}
          """
          result_html
        `;

        const result = await pyodide.runPythonAsync(pythonCode);
        setResult(result);
      } catch (err) {
        setError("Error running Pandas operation: " + err);
      } finally {
        setLoading(false);
      }
    };

    runPandasOperation();
  }, [data, pyodide, rows, columns, aggregation]);

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto overflow-x-auto">
      {loading && <div>Loading...</div>}
      {result && (
        <div
          className="flex p-4 w-full h-full rounded-md border border-separate overflow-y-auto overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: result }}
        />
      )}
    </div>
  );
}
