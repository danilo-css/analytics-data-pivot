import { AsyncDuckDB } from "duckdb-wasm-kit";
import { create } from "zustand";
import * as duckdb from "@duckdb/duckdb-wasm";

export type FieldsType = {
  name: string;
  type: string;
};

type TableState = {
  queryResults: Record<string, unknown[]>;
  setQueryResults: (tableName: string, results: unknown[]) => void;
  clearResults: (tableName: string) => void;
  queryFields: Record<string, FieldsType[]>;
  setQueryFields: (tableName: string, fields: FieldsType[]) => void;
  clearQueryFields: (tableName: string) => void;
  isLoadingFields: boolean;
  setQueryFieldsFromFiles: (
    files: File[],
    db: AsyncDuckDB,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    runQuery: any
  ) => Promise<void>;
};

export const useTableStore = create<TableState>((set) => ({
  queryResults: {},
  setQueryResults: (tableName, results) =>
    set((state) => ({
      queryResults: { ...state.queryResults, [tableName]: results },
    })),
  clearResults: (tableName) =>
    set((state) => {
      const newResults = { ...state.queryResults };
      delete newResults[tableName];
      return { queryResults: newResults };
    }),
  queryFields: {},
  isLoadingFields: false,
  setQueryFields: (tableName, fields) => {
    set((state) => ({
      queryFields: { ...state.queryFields, [tableName]: fields },
    }));
  },
  setQueryFieldsFromFiles: async (files, db, runQuery) => {
    const store = useTableStore.getState();
    set({ isLoadingFields: true });
    try {
      for (const file of Object.values(files)) {
        await db.registerFileHandle(
          file.name,
          file,
          duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
          true
        );
        const query = `SELECT * FROM '${file.name}' LIMIT 1`;
        const result = await runQuery(db, query);

        const fields: FieldsType[] = result.schema.fields
          .filter(
            (field: { name: string; type: string }) =>
              field.name !== "__index_level_0__"
          )
          .map((field: { name: string; type: string }) => ({
            name: field.name,
            type: field.type.toString(),
          }));

        store.setQueryFields(file.name, fields);
      }
    } finally {
      set({ isLoadingFields: false });
    }
  },
  clearQueryFields: (tableName) =>
    set((state) => {
      const newFields = { ...state.queryFields };
      delete newFields[tableName];
      return { queryFields: newFields };
    }),
}));
