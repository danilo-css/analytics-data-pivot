import { create } from "zustand";
import type { PyodideInterface } from "pyodide";
import { PYODIDE_VERSION } from "@/lib/constants";

type PyodideStore = {
  pyodide: PyodideInterface | null;
  loadingpyodide: boolean;
  errorpyodide: Error | null;
  initializePyodide: () => Promise<void>;
};

export const usePyodideStore = create<PyodideStore>((set) => ({
  pyodide: null,
  loadingpyodide: false,
  errorpyodide: null,
  initializePyodide: async () => {
    try {
      set({ loadingpyodide: true, errorpyodide: null });

      // Load Pyodide script
      const script = document.createElement("script");
      script.src = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js`;
      script.async = true;
      document.body.appendChild(script);

      await new Promise<void>((resolve) => {
        script.onload = async () => {
          try {
            // Initialize Pyodide
            const pyodideInstance = await (
              window as Window &
                typeof globalThis & {
                  loadPyodide: (options: {
                    indexURL: string;
                  }) => Promise<PyodideInterface>;
                }
            ).loadPyodide({
              indexURL: `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`,
            });

            // Install and import pandas
            await pyodideInstance.loadPackage("pandas");
            await pyodideInstance.loadPackage("Jinja2");
            await pyodideInstance.loadPackage("micropip");
            await pyodideInstance.runPythonAsync(`
              import pandas as pd
              import js
              import micropip
              await micropip.install('openpyxl')
              await micropip.install('pyarrow')
            `);

            set({ pyodide: pyodideInstance, loadingpyodide: false });
            resolve();
          } catch (errorpyodide) {
            set({ errorpyodide: errorpyodide as Error, loadingpyodide: false });
          }
        };
      });
    } catch (errorpyodide) {
      set({ errorpyodide: errorpyodide as Error, loadingpyodide: false });
    }
  },
}));
