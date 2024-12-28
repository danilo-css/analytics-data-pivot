import { create } from "zustand";
import { AsyncDuckDB, initializeDuckDb } from "duckdb-wasm-kit";
import { DuckDBConfig } from "@duckdb/duckdb-wasm";

type DuckDBStore = {
  db: AsyncDuckDB | null;
  loadingduckdb: boolean;
  errorduckdb: Error | null;
  initializeDuckDB: () => Promise<void>;
};

export const useDuckDBStore = create<DuckDBStore>((set) => ({
  db: null,
  loadingduckdb: false,
  errorduckdb: null,
  initializeDuckDB: async () => {
    try {
      set({ loadingduckdb: true, errorduckdb: null });

      const config: DuckDBConfig = {
        query: {
          castBigIntToDouble: true,
        },
      };

      try {
        const duckDBInstance = await initializeDuckDb({ config, debug: false });
        set({ db: duckDBInstance, loadingduckdb: false });
      } catch (errorduckdb) {
        set({ errorduckdb: errorduckdb as Error, loadingduckdb: false });
      }
    } catch (errorduckdb) {
      set({ errorduckdb: errorduckdb as Error, loadingduckdb: false });
    }
  },
}));
