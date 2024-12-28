"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DuckDBConfig } from "@duckdb/duckdb-wasm";
import * as duckdb from "@duckdb/duckdb-wasm";
import { initializeDuckDb, runQuery, useDuckDb } from "duckdb-wasm-kit";
import PyodidePandas from "./PyodidePandas";
import FileManager from "./FileManager";
import { useFileStore } from "@/stores/useFileStore";

export default function DuckDBProcessor() {
  useEffect(() => {
    const config: DuckDBConfig = {
      query: {
        castBigIntToDouble: true,
      },
    };
    initializeDuckDb({ config, debug: false });
  }, []);

  const { db } = useDuckDb();
  const { files } = useFileStore();
  const [result, setResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async () => {
    if (!files || !db) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      for (const file of Object.values(files)) {
        // Register the file with DuckDB
        await db.registerFileHandle(
          file.name,
          file,
          duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
          true
        );
        // Query the file
        const query = `SELECT * FROM '${file.name}' LIMIT 10`;
        console.log("Running query:", query);
        const result = await runQuery(db, query);

        // Convert the result to a string for display
        setResult(JSON.parse(result.toString()));
        console.log(JSON.parse(result.toString()));
      }
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
      <FileManager />
      {files && db && (
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
      {result && (
        <div>
          Check console for result!
          <PyodidePandas data={result} />
        </div>
      )}
    </div>
  );
}
