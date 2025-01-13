import * as React from "react";
import { usePivotStore } from "@/stores/usePivotStore";

export function SelectAggregation() {
  const { aggregation, setAggregation } = usePivotStore();
  return (
    <>
      {aggregation.type && aggregation.table && aggregation.name && (
        <select
          value={aggregation.type}
          onChange={(e) =>
            aggregation.table && aggregation.name
              ? setAggregation(
                  aggregation.table,
                  aggregation.name,
                  e.target.value as typeof aggregation.type
                )
              : null
          }
          className="w-[100px] bg-black px-2 py-1 border rounded cursor-pointer"
        >
          <option value="SUM" className="cursor-pointer">
            SUM
          </option>
          <option value="AVG" className="cursor-pointer">
            AVG
          </option>
          <option value="MIN" className="cursor-pointer">
            MIN
          </option>
          <option value="MAX" className="cursor-pointer">
            MAX
          </option>
        </select>
      )}
    </>
  );
}
