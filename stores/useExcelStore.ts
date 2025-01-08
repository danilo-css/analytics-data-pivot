/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { create } from "zustand";

interface ExcelState {
  result: string;
  excelData: Uint8Array | null;
  setResult: (result: string) => void;
  setExcelData: (data: Uint8Array | null) => void;
  handleDownload: () => void;
}

export const useExcelStore = create<ExcelState>((set) => ({
  result: "",
  excelData: null,
  setResult: (result: string) => set({ result }),
  setExcelData: (data: Uint8Array | null) => set({ excelData: data }),
  handleDownload: () => {
    const { excelData } = useExcelStore.getState();
    if (excelData) {
      const blob = new Blob([excelData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pivot_table.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  },
}));
