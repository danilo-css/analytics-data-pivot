import { create } from "zustand";
import { AsyncDuckDB, initializeDuckDb } from "duckdb-wasm-kit";
import { DuckDBConfig } from "@duckdb/duckdb-wasm";

type DuckDBStore = {
  db: AsyncDuckDB | null;
  loadingduckdb: boolean;
  errorduckdb: Error | null;
  initializeDuckDB: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runQuery: (db: AsyncDuckDB, sql: string) => Promise<any>;
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
  runQuery: async (db, sql) => {
    const conn = await db.connect();
    const arrow = await conn.query(sql);
    await conn.close();
    return arrow;
  },
}));
