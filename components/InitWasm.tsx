"use client";

import { useDuckDBStore } from "@/stores/useDuckDBStore";
import { usePyodideStore } from "@/stores/usePyodideStore";
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
    <>
      {loadingduckdb && <p>Loading DuckDB...</p>}
      {db && <p>DuckDB initialized succesfully.</p>}
      {errorduckdb && <p>Error initializing DuckDB: {errorduckdb.message}</p>}
      {loadingpyodide && <p>Loading Pyodide...</p>}
      {pyodide && <p>Pyodide initialized succesfully.</p>}
      {errorpyodide && (
        <p>Error initializing Pyodide: {errorpyodide.message}</p>
      )}
    </>
  );
}
