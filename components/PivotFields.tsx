"use client";

import React from "react";
import Aggregation from "./pivotfields/Aggregation";
import PivotColumns from "./pivotfields/PivotColumns";
import PivotRows from "./pivotfields/PivotRows";
import PivotFilters from "./pivotfields/PivotFilters";

export default function PivotFields() {
  return (
    <div className="flex md:flex-row gap-1 w-full h-fit">
      <div className="flex w-[300px] h-full">
        <Aggregation />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <PivotRows />
        <PivotColumns />
        <PivotFilters />
      </div>
    </div>
  );
}
