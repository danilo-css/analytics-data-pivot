import { usePivotStore } from "@/stores/usePivotStore";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Database, Rows3, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { useFileStore } from "@/stores/useFileStore";

export default function PivotRows() {
  const { rows, clearRow, clearRows } = usePivotStore();
  const { files } = useFileStore();

  const moveRows = (fromIndex: number, toIndex: number) => {
    const newRows = [...rows];
    const [movedColumn] = newRows.splice(fromIndex, 1);
    newRows.splice(toIndex, 0, movedColumn);
    // Update the store with new column order
    // You'll need to add this function to your store
    usePivotStore.setState({ rows: newRows });
  };

  return (
    <div className="flex flex-row items-center gap-3 border rounded-lg justify-between px-4 py-1">
      <div className="flex flex-row items-center gap-1">
        <Rows3 size={20} />
        <p>Rows</p>
      </div>
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
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <ArrowLeft
                    className="cursor-pointer hover:text-blue-500"
                    size={16}
                    onClick={() => moveRows(index, index - 1)}
                  />
                )}
                {index < rows.length - 1 && (
                  <ArrowRight
                    className="cursor-pointer hover:text-blue-500"
                    size={16}
                    onClick={() => moveRows(index, index + 1)}
                  />
                )}
                <Trash2
                  className="cursor-pointer hover:text-black"
                  size={20}
                  onClick={() => clearRow(row.table, row.name)}
                />
              </div>
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
