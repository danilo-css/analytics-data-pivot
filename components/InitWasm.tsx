"use client";

import { useDuckDBStore } from "@/stores/useDuckDBStore";
import { usePyodideStore } from "@/stores/usePyodideStore";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import React, { useEffect } from "react";

export default function InitWasm() {
  const { pyodide, loadingpyodide, errorpyodide, initializePyodide } =
    usePyodideStore();
  const { db, loadingduckdb, errorduckdb, initializeDuckDB } = useDuckDBStore();

  useEffect(() => {
    initializePyodide();
    initializeDuckDB();
  }, []);

  return (
    <div>
      {loadingduckdb && (
        <div className="flex flex-row items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <p>Loading DuckDB...</p>
        </div>
      )}
      {db && (
        <div className="flex flex-row items-center">
          <CircleCheck color="#008a35" className="mr-2 h-4 w-4" />
          <p>DuckDB initialized succesfully.</p>
        </div>
      )}
      {errorduckdb && (
        <div className="flex flex-row items-center">
          <CircleX color="#ff0000" className="mr-2 h-4 w-4" />
          <p>Error initializing DuckDB: {errorduckdb.message}</p>
        </div>
      )}
      {loadingpyodide && (
        <div className="flex flex-row items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <p>Loading Pyodide...</p>
        </div>
      )}
      {pyodide && (
        <div className="flex flex-row items-center">
          <CircleCheck color="#008a35" className="mr-2 h-4 w-4" />
          <p>Pyodide initialized succesfully.</p>
        </div>
      )}
      {errorpyodide && (
        <div className="flex flex-row items-center">
          <CircleX color="#ff0000" className="mr-2 h-4 w-4" />
          <p>Error initializing Pyodide: {errorpyodide.message}</p>
        </div>
      )}
    </div>
  );
}
