/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useExcelStore } from "@/stores/useExcelStore";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export default function PyodidePandas() {
  const { result } = useExcelStore();

  return (
    <>
      {result && (
        <>
          <div
            className="flex p-4 w-full h-full rounded-md border border-separate overflow-y-auto overflow-x-auto [&_table]:border [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:px-2 [&_td]:text-center [&_th]:text-center"
            dangerouslySetInnerHTML={{ __html: result.replace(/nan/g, "") }}
          />
        </>
      )}
    </>
  );
}
