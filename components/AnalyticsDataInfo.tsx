import React from "react";
import { useDuckDBStore } from "@/stores/useDuckDBStore";
import { usePyodideStore } from "@/stores/usePyodideStore";
import { SiGithubsponsors } from "react-icons/si";
import { FaGithub } from "react-icons/fa";

export default function AnalyticsDataInfo() {
  const { pyodide } = usePyodideStore();
  const { db } = useDuckDBStore();
  return (
    <>
      {pyodide && db && (
        <div className="flex flex-col items-center justify-center gap-2 text-zinc-500 text-sm pt-2 mt-auto border rounded-lg min-w-[300px] py-2">
          <div className="flex flex-row items-center justify-center gap-10">
            <div className="flex flex-col items-center justify-center">
              <p>Contact us:</p>
              <a
                href="mailto:contact@analyticsdata.pro"
                className="hover:text-white"
              >
                contact@analyticsdata.pro
              </a>
            </div>
            <a
              href="https://github.com/danilo-css/analytics-data-pivot"
              className="hover:text-white"
            >
              <FaGithub size={20} />
            </a>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 px-2">
            <p>Support us: </p>
            <a
              href="https://github.com/sponsors/danilo-css"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex flex-row items-center justify-center gap-2 px-3 py-2 group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000 before:ease-in-out border border-transparent hover:border-white/10 rounded-md hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all">
                <SiGithubsponsors className="group-hover:text-red-600 transition-colors hidden group-hover:block" />
                <div className="flex flex-col items-center">
                  <p className=" group-hover:text-white transition-colors text-xs">
                    SPONSOR
                  </p>
                  <p className="text-zinc-500 group-hover:text-white transition-colors text-xs">
                    (GitHub)
                  </p>
                </div>
              </div>
            </a>
            <a
              href="https://www.paypal.com/donate/?business=VM8L5KP6R5FQY&no_recurring=0&item_name=Thank+you+for+donating.+Your+money+goes+toward+covering+server+expenses+and+developing+the+app+further.&currency_code=USD"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex flex-row items-center justify-center gap-2 px-3 py-2 group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000 before:ease-in-out border border-transparent hover:border-white/10 rounded-md hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all">
                <SiGithubsponsors className="group-hover:text-red-600 transition-colors text-zinc-500 hidden group-hover:block" />
                <div className="flex flex-col items-center">
                  <p className="text-zinc-500 group-hover:text-white transition-colors text-xs">
                    DONATE
                  </p>
                  <p className="text-zinc-500 group-hover:text-white transition-colors text-xs">
                    (PayPal)
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
