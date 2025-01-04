"use client";

import PivotColumns from "./pivotfields/PivotColumns";
import PivotRows from "./pivotfields/PivotRows";

export default function PivotFields() {
  return (
    <>
      <PivotRows />
      <PivotColumns />
    </>
  );
}
