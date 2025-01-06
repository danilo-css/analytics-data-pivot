"use client";

import React, { useEffect, useState } from "react";
import FileManager from "./FileManager";
import { useFileStore } from "@/stores/useFileStore";
import { useDuckDBStore } from "@/stores/useDuckDBStore";
import InitWasm from "./InitWasm";
import { usePyodideStore } from "@/stores/usePyodideStore";
import { useTableStore } from "@/stores/useTableStore";
import FieldSelection from "./FieldSelection";
import PivotFields from "./PivotFields";
import { Play } from "lucide-react";
import BuildQuery from "@/lib/BuildQuery";
import { useQueryStore } from "@/stores/useQueryStore";

export default function Main() {
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
    <main className="relative md:absolute flex flex-col md:flex-row items-center md:items-start justify-center h-full w-full gap-1 py-1 px-1">
      <section className="relative md:w-fit w-full md:h-full flex-shrink-0">
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
      <section className="relative w-full md:h-full items-center justify-center">
        <div className="flex flex-col gap-1">
          <PivotFields />
          <div className="flex flex-row cursor-pointer gap-1 py-1 px-2 border rounded-md w-fit">
            <Play size={20} />
            <p>Run query</p>
          </div>
        </div>
      </section>
    </main>
  );
}
