import { Metadata } from "next";
import Main from "../components/Main";

export const metadata: Metadata = {
  title: "Analytics Data Pivot (ADPivot) | AnalyticsData.Pro",
  description:
    "Analytics Data Pivot (ADPivot) is a powerful Data Analytics tool, allowing users to build pivot tables from Excel or Parquet files, powered by DuckDB-Wasm and Pyodide.",
};

export default function Home() {
  return <Main />;
}
