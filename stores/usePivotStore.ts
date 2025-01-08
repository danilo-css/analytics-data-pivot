import { create } from "zustand";

type rowType = {
  name: string;
  table: string;
};

type columnType = {
  name: string;
  table: string;
};

type aggregationType = {
  name?: string;
  table?: string;
  type?: "SUM" | "AVG" | "MIN" | "MAX";
};

type filterType = {
  name: string;
  table: string;
  values: string[];
};

export type PivotState = {
  rows: rowType[];
  setRows: (table: string, rows: string[]) => void;
  addRow: (table: string, row: string) => void;
  clearRow: (table: string, row: string) => void;
  clearRows: () => void;
  clearFileRows: (table?: string) => void;
  columns: columnType[];
  setColumns: (table: string, columns: string[]) => void;
  addColumn: (table: string, column: string) => void;
  clearColumn: (table: string, column: string) => void;
  clearColumns: () => void;
  clearFileColumns: (table?: string) => void;
  aggregation: aggregationType;
  setAggregation: (
    table: string,
    aggregation: string,
    type: "SUM" | "AVG" | "MIN" | "MAX"
  ) => void;
  clearAggregation: () => void;
  clearFileAggregation: (table?: string) => void;
  filters: filterType[];
  setFilters: (table: string, filters: filterType[]) => void;
  clearFilter: (table: string, filter: filterType) => void;
  clearFilters: () => void;
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
  clearFileRows: (table) =>
    set((state) => ({
      rows: table ? state.rows.filter((r) => r.table !== table) : [],
    })),
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
  clearFileColumns: (table) =>
    set((state) => ({
      columns: table ? state.columns.filter((c) => c.table !== table) : [],
    })),
  aggregation: {},
  setAggregation: (table, name, type) => {
    set(() => ({
      aggregation: {
        table: table,
        name: name,
        type: type,
      },
    }));
  },
  clearAggregation: () => set({ aggregation: {} }),
  clearFileAggregation: (table) =>
    set((state) => ({
      aggregation:
        table && state.aggregation.table === table ? {} : state.aggregation,
    })),
  filters: [],
  setFilters: (table, filters) => {
    set((state) => ({
      filters: [
        ...state.filters,
        ...filters
          .filter(
            (filter) =>
              !state.filters.some(
                (f) =>
                  f.table === table &&
                  f.name === filter.name &&
                  f.values.join(",") === filter.values.join(",")
              )
          )
          .map((filter) => ({
            name: filter.name,
            table: table,
            values: filter.values,
          })),
      ],
    }));
  },
  clearFilter: (table, filter) => {
    set((state) => ({
      filters: state.filters.filter(
        (f) => !(f.table === table && f.name === filter.name)
      ),
    }));
  },
  clearFilters: () => set({ filters: [] }),
}));
