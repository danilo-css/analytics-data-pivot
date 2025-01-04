import { create } from "zustand";

type rowType = {
  name: string;
  table: string;
};

type columnType = {
  name: string;
  table: string;
};

export type PivotState = {
  rows: rowType[];
  setRows: (table: string, rows: string[]) => void;
  addRow: (table: string, row: string) => void;
  clearRow: (table: string, row: string) => void;
  clearRows: () => void;
  columns: columnType[];
  setColumns: (table: string, columns: string[]) => void;
  addColumn: (table: string, column: string) => void;
  clearColumn: (table: string, column: string) => void;
  clearColumns: () => void;
};

export const usePivotStore = create<PivotState>((set) => ({
  rows: [],
  setRows: (table, rows) =>
    set((state) => ({
      rows: [
        ...state.rows,
        ...rows
          .filter(
            (row) =>
              !state.rows.some((r) => r.table === table && r.name === row)
          )
          .map((row) => ({ name: row, table })),
      ],
    })),
  addRow: (table, row) => {
    set((state) => {
      if (state.rows.some((r) => r.table === table && r.name === row)) {
        return { rows: state.rows };
      }
      return {
        rows: [...state.rows, { name: row, table: table }],
      };
    });
  },
  clearRow: (table, row) => {
    set((state) => ({
      rows: state.rows.filter((r) => !(r.table === table && r.name === row)),
    }));
  },
  clearRows: () => set({ rows: [] }),
  columns: [],
  setColumns: (table, columns) =>
    set((state) => ({
      columns: [
        ...state.columns,
        ...columns
          .filter(
            (column) =>
              !state.columns.some((c) => c.table === table && c.name === column)
          )
          .map((column) => ({ name: column, table })),
      ],
    })),
  addColumn: (table, column) => {
    set((state) => {
      if (state.columns.some((c) => c.table === table && c.name === column)) {
        return { columns: state.columns };
      }
      return {
        columns: [...state.columns, { name: column, table: table }],
      };
    });
  },
  clearColumn: (table, column) => {
    set((state) => ({
      columns: state.columns.filter(
        (c) => !(c.table === table && c.name === column)
      ),
    }));
  },
  clearColumns: () => set({ columns: [] }),
}));
