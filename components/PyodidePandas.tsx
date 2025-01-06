/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { usePyodideStore } from "@/stores/usePyodideStore";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export default function PyodidePandas({ data }: { data: any }) {
  const { pyodide } = usePyodideStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const runPandasOperation = async () => {
    if (!pyodide) return;

    try {
      setLoading(true);

      console.log(data);

      pyodide.globals.set("js_data", data);

      // Example data
      const pythonCode = `
        print(js_data.to_py())
        df = pd.json_normalize(js_data.to_py())
        
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Pyodide Pandas Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={runPandasOperation}
            disabled={loading || !pyodide}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Pandas Operation...
              </>
            ) : (
              "Run Pandas Operation"
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
          )}

          {result && (
            <div
              className="p-4 bg-gray-50 rounded-md overflow-x-auto border-collapse"
              dangerouslySetInnerHTML={{ __html: result }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
