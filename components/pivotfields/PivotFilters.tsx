import { usePivotStore } from "@/stores/usePivotStore";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Database, Filter, Trash2 } from "lucide-react";
import { useFileStore } from "@/stores/useFileStore";
import FilterDialog from "../FilterDialog";

export default function PivotFilters() {
  const { filters, clearFilter, clearFilters } = usePivotStore();
  const { files } = useFileStore();

  return (
    <div className="flex flex-row items-center gap-3 border rounded-lg justify-between px-4 py-1">
      <div className="flex flex-row items-center gap-1 w-[100px]">
        <Filter size={20} />
        <p>Filters</p>
      </div>
      <div className="flex flex-row flex-wrap items-center gap-2 justify-center">
        {filters.map((filter) => (
          <div
            key={`${filter.table}-${filter.field}`}
            className="flex flex-col items-center gap-2"
          >
            <Badge className="flex flex-row items-center gap-2">
              <div className="relative">
                <Database size={16} />
                <span className="absolute -bottom-[6px] -right-[6px] text-xs bg-black px-1 rounded-md">
                  {files.findIndex((file) => file.name === filter.table)}
                </span>
              </div>
              <div>{filter.field}</div>
              <FilterDialog
                table={filter.table}
                field={filter.field}
                dateExtract={filter.dateExtract}
              />
              <Trash2
                className="cursor-pointer hover:text-black"
                size={20}
                onClick={() => clearFilter(filter.table, filter.field)}
              />
            </Badge>
          </div>
        ))}
      </div>
      <Trash2
        onClick={clearFilters}
        size={24}
        className="cursor-pointer hover:text-blue-500 min-w-[24px]"
      />
    </div>
  );
}
