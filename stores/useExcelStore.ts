import { create } from "zustand";

interface ExcelStore {
  result: boolean;
  setResult: (result: boolean) => void;
}

export const useExcelStore = create<ExcelStore>((set) => ({
  result: false,
  setResult: (result) => set({ result }),
}));
