import { create } from "zustand";

export type PivotState = {
  lines: Record<string, string[]>;
  setLines: (table: string, lines: string[]) => void;
  clearLines: () => void;
  columns: Record<string, string[]>;
  setColumns: (table: string, lines: string[]) => void;
  clearColumns: () => void;
};

export const usePivotStore = create<PivotState>((set) => ({
  lines: {},
  setLines: (table, lines) =>
    set((state) => ({ lines: { ...state.lines, [table]: lines } })),
  clearLines: () => set({ lines: {} }),
  columns: {},
  setColumns: (table, columns) =>
    set((state) => ({ columns: { ...state.columns, [table]: columns } })),
  clearColumns: () => set({ columns: {} }),
}));
