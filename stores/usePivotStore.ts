import { create } from "zustand";

type rowType = {
  name: string;
  table: string;
  dateExtract?: "YEAR" | "MONTH" | "QUARTER";
};

type columnType = {
  name: string;
  table: string;
  dateExtract?: "YEAR" | "MONTH" | "QUARTER";
};

type aggregationType = {
  name?: string;
  table?: string;
  type?: "SUM" | "AVG" | "MIN" | "MAX";
};

export type filterType = {
  table: string;
  field: string;
  values: string[];
  dateExtract?: "YEAR" | "MONTH" | "QUARTER";
};

export type PivotState = {
  rows: rowType[];
  setRows: (table: string, rows: string[]) => void;
  addRow: (
    table: string,
    row: string,
    dateExtract?: "YEAR" | "MONTH" | "QUARTER"
  ) => void;
  clearRow: (table: string, row: string) => void;
  clearRows: () => void;
  clearFileRows: (table?: string) => void;
  columns: columnType[];
  setColumns: (table: string, columns: string[]) => void;
  addColumn: (
    table: string,
    column: string,
    dateExtract?: "YEAR" | "MONTH" | "QUARTER"
  ) => void;
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
  addFilter: (
    table: string,
    field: string,
    values: string[],
    dateExtract?: "YEAR" | "MONTH" | "QUARTER"
  ) => void;
  clearFilter: (table: string, field: string) => void;
  clearFilters: () => void;
  clearFileFilters: (table?: string) => void;
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
  addRow: (table, row, dateExtract) => {
    set((state) => {
      const fieldId = dateExtract ? `${dateExtract}(${row})` : row;
      if (state.rows.some((r) => r.table === table && r.name === fieldId)) {
        return { rows: state.rows };
      }
      return {
        rows: [...state.rows, { name: fieldId, table, dateExtract }],
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
  addColumn: (table, column, dateExtract) => {
    set((state) => {
      const fieldId = dateExtract ? `${dateExtract}(${column})` : column;
      if (state.columns.some((c) => c.table === table && c.name === fieldId)) {
        return { columns: state.columns };
      }
      return {
        columns: [...state.columns, { name: fieldId, table, dateExtract }],
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
  addFilter: (table, field, values, dateExtract) => {
    set((state) => {
      const fieldId = dateExtract ? `${dateExtract}(${field})` : field;
      const filteredFilters = state.filters.filter(
        (f) => !(f.table === table && f.field === fieldId)
      );
      return {
        filters: [
          ...filteredFilters,
          { table, field: fieldId, values, dateExtract },
        ],
      };
    });
  },
  clearFilter: (table, field) => {
    set((state) => ({
      filters: state.filters.filter(
        (f) => !(f.table === table && f.field === field)
      ),
    }));
  },
  clearFilters: () => set({ filters: [] }),
  clearFileFilters: (table) =>
    set((state) => ({
      filters: table ? state.filters.filter((f) => f.table !== table) : [],
    })),
}));
