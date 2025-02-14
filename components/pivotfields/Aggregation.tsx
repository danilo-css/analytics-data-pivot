import { usePivotStore } from "@/stores/usePivotStore";
import React from "react";
import { Badge } from "../ui/badge";
import { Database, SquareSigma, Trash2 } from "lucide-react";
import { useFileStore } from "@/stores/useFileStore";
import { SelectAggregation } from "./SelectAggregation";

export default function Aggregation() {
  const { aggregation, clearAggregation } = usePivotStore();
  const { files } = useFileStore();
  return (
    <div className="flex flex-col items-center gap-3 border rounded-lg px-4 py-1 h-fit w-full">
      <div className="flex flex-row items-center gap-1">
        <SquareSigma size={20} />
        <p>Aggregation</p>
      </div>
      <SelectAggregation />
      {aggregation.name && aggregation.table && (
        <Badge className="flex flex-row items-center gap-2">
          <div className="relative">
            <Database size={16} />
            <span className="absolute -bottom-[6px] -right-[6px] text-xs bg-black px-1 rounded-md">
              {files.findIndex((file) => file.name === aggregation.table)}
            </span>
          </div>
          <div>{aggregation.name}</div>
          <Trash2
            className="cursor-pointer hover:text-black"
            size={20}
            onClick={() => clearAggregation()}
          />
        </Badge>
      )}
    </div>
  );
}
