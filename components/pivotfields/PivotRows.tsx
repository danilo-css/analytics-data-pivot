import { usePivotStore } from "@/stores/usePivotStore";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Database, Trash2 } from "lucide-react";
import { useFileStore } from "@/stores/useFileStore";

export default function PivotRows() {
  const { rows, clearRow, clearRows } = usePivotStore();
  const { files } = useFileStore();

  return (
    <div className="flex flex-row items-center gap-3 border rounded-lg justify-between px-4 py-1">
      <div className="w-4">Rows</div>
      <div className="flex flex-row flex-wrap items-center gap-2">
        {rows.map((row, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Badge className="flex flex-row items-center gap-2">
              <div className="relative">
                <Database size={16} />
                <span className="absolute -bottom-[6px] -right-[6px] text-xs bg-black px-1 rounded-md">
                  {files.findIndex((file) => file.name === row.table)}
                </span>
              </div>
              <div>{row.name}</div>
              <Trash2
                className="cursor-pointer hover:text-black"
                size={20}
                onClick={() => clearRow(row.table, row.name)}
              />
            </Badge>
          </div>
        ))}
      </div>
      <Trash2
        onClick={clearRows}
        size={24}
        className="cursor-pointer hover:text-blue-500"
      />
    </div>
  );
}
