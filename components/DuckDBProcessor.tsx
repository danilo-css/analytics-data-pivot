"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import * as duckdb from "@duckdb/duckdb-wasm";
import FileManager from "./FileManager";
import { useFileStore } from "@/stores/useFileStore";
import { useDuckDBStore } from "@/stores/useDuckDBStore";
import InitWasm from "./InitWasm";
import { usePyodideStore } from "@/stores/usePyodideStore";
import { FieldsType, useTableStore } from "@/stores/useTableStore";

export default function DuckDBProcessor() {
  const { db, runQuery } = useDuckDBStore();
  const { pyodide } = usePyodideStore();
  const { files } = useFileStore();
  const {
    queryResults,
    setQueryResults,
    clearResults,
    queryFields,
    setQueryFields,
    setQueryFieldsFromFiles,
  } = useTableStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async () => {
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
  };

  console.log("queryResults:", queryFields);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <InitWasm />
      {pyodide && db && <FileManager />}
      {files.length > 0 && db && (
        <Button onClick={processFile} className="mt-4" disabled={loading}>
          {loading ? "Processing..." : "Process File with DuckDB"}
        </Button>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {loading && <div>Loading...</div>}
    </div>
  );
}
