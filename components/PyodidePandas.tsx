"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

const PYODIDE_VERSION = "0.26.4";

const PyodidePandas: React.FC = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const initPyodide = async () => {
      try {
        // Load Pyodide script
        const script = document.createElement("script");
        script.src = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
          // Initialize Pyodide
          const pyodideInstance = await window.loadPyodide({
            indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
          });

          // Install and import pandas
          await pyodideInstance.loadPackage("pandas");
          await pyodideInstance.runPythonAsync(`
            import pandas as pd
            import js
          `);

          setPyodide(pyodideInstance);
          setLoading(false);
        };
      } catch (err) {
        setError("Failed to initialize Pyodide: " + err);
        setLoading(false);
      }
    };

    initPyodide();
  }, []);

  const runPandasOperation = async () => {
    if (!pyodide) return;

    try {
      setLoading(true);

      // Example data
      const pythonCode = `
        # Create a sample DataFrame
        df = pd.DataFrame({
          'A': [1, 2, 3, 4, 10000],
          'B': [10, 20, 30, 40, 50],
          'C': ['a', 'b', 'c', 'd', 'e']
        })

        # Perform some operations
        summary = df.describe()
        mean_values = df.mean(numeric_only=True)
        
        # Convert results to HTML for display
        result_html = f"""
        {df.transpose().to_html()}
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
};

export default PyodidePandas;
