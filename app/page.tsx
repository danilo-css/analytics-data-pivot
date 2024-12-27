import PyodidePandas from "@/components/PyodidePandas";
import DuckDBProcessor from "../components/DuckDBProcessor";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <DuckDBProcessor />
      <PyodidePandas />
    </main>
  );
}
