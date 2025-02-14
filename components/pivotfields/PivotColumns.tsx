import { usePivotStore } from "@/stores/usePivotStore";
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Columns3,
  Database,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useFileStore } from "@/stores/useFileStore";

export default function PivotColumns() {
  const { columns, clearColumn, clearColumns } = usePivotStore();
  const { files } = useFileStore();

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    // Update the store with new column order
    // You'll need to add this function to your store
    usePivotStore.setState({ columns: newColumns });
  };

  return (
    <div className="flex flex-row items-center gap-3 border rounded-lg justify-between px-4 py-1">
      <div className="flex flex-row items-center gap-1 w-[100px]">
        <Columns3 size={20} />
        <p>Columns</p>
      </div>
      <div className="flex flex-row flex-wrap items-center gap-2 justify-center">
        {columns.map((column, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Badge className="flex flex-row items-center gap-2">
              <div className="relative">
                <Database size={16} />
                <span className="absolute -bottom-[6px] -right-[6px] text-xs bg-black px-1 rounded-md">
                  {files.findIndex((file) => file.name === column.table)}
                </span>
              </div>
              <div>{column.name}</div>
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <ArrowLeft
                    className="cursor-pointer hover:text-blue-500"
                    size={16}
                    onClick={() => moveColumn(index, index - 1)}
                  />
                )}
                {index < columns.length - 1 && (
                  <ArrowRight
                    className="cursor-pointer hover:text-blue-500"
                    size={16}
                    onClick={() => moveColumn(index, index + 1)}
                  />
                )}
                <Trash2
                  className="cursor-pointer hover:text-black"
                  size={20}
                  onClick={() => clearColumn(column.table, column.name)}
                />
              </div>
            </Badge>
          </div>
        ))}
      </div>
      <Trash2
        onClick={clearColumns}
        size={24}
        className="cursor-pointer hover:text-blue-500 min-w-[24px]"
      />
    </div>
  );
}
