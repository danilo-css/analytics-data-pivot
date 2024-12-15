"use client";

import React, { useState, useEffect } from "react";
import FileReader from "@/components/FileReader";
import { Button } from "@/components/ui/button";
import { DuckDBConfig } from "@duckdb/duckdb-wasm";
import {
  initializeDuckDb,
  insertFile,
  runQuery,
  useDuckDb,
} from "duckdb-wasm-kit";

export default function DuckDBProcessor() {
  useEffect(() => {
    const config: DuckDBConfig = {
      query: {
        castBigIntToDouble: true,
      },
    };
    initializeDuckDb({ config, debug: true });
  }, []);

  const { db } = useDuckDb();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const processFile = async () => {
    if (!file || !db) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Register the file with DuckDB
      await insertFile(db, file, file.name);
      // Query the file
      const query = `SELECT * FROM '${file.name}' LIMIT 10`;
      console.log("Running query:", query);
      const result = await runQuery(db, query);

      // Convert the result to a string for display
      setResult(JSON.stringify(result, null, 2));
      console.log(result);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(
        "Error processing file. Please check the console for more details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <FileReader onFileSelect={handleFileSelect} />
      {file && db && (
        <Button onClick={processFile} className="mt-4" disabled={loading}>
          {loading ? "Processing..." : "Process File with DuckDB"}
        </Button>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Query Result:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
