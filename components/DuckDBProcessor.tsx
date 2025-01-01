"use client";

import React, { useEffect, useState } from "react";
import FileManager from "./FileManager";
import { useFileStore } from "@/stores/useFileStore";
import { useDuckDBStore } from "@/stores/useDuckDBStore";
import InitWasm from "./InitWasm";
import { usePyodideStore } from "@/stores/usePyodideStore";
import { useTableStore } from "@/stores/useTableStore";
import FieldSelection from "./FieldSelection";

export default function DuckDBProcessor() {
  const { db, runQuery } = useDuckDBStore();
  const { pyodide } = usePyodideStore();
  const { files } = useFileStore();
  const { setQueryFieldsFromFiles } = useTableStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [files]);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <InitWasm />
      {pyodide && db && <FileManager />}
      {files.length > 0 && db && <FieldSelection />}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {loading && <div>Loading...</div>}
    </div>
  );
}
