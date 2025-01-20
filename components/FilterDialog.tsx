import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDuckDBStore } from "@/stores/useDuckDBStore";
import { ChevronLeft, ChevronRight, Filter, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { usePivotStore } from "@/stores/usePivotStore";
import { Table as Arrow } from "apache-arrow";

export default function FilterDialog({
  table,
  field,
}: {
  table: string;
  field: string;
}) {
  const { db, runQuery } = useDuckDBStore();
  const { filters, addFilter } = usePivotStore();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    filters.find((filter) => filter.table === table && filter.field === field)
      ?.values || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const itemsPerPage = 10;

  const fetchData = async () => {
    if (db) {
      setLoading(true);
      const result: Arrow = await runQuery(
        db,
        `
        SELECT DISTINCT "${field}"
        FROM '${table}'
        ORDER BY "${field}" ASC`
      );

      const cleanedData = result.toArray().map((row) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanedRow: any = {};
        for (const [key, value] of Object.entries(row)) {
          cleanedRow[key] =
            typeof value === "string" ? value.replace(/"/g, "") : value;
        }
        return cleanedRow;
      });

      setValues(
        cleanedData.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (obj: any) => obj[field]?.toString() ?? "(Null)"
        )
      );
      setLoading(false);
    }
  };

  const filteredValues = values.filter((value) =>
    value.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredValues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedValues = filteredValues.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const toggleSelection = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    addFilter(table, field, selectedValues);
  };

  const clearAll = () => {
    setSelectedValues([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCurrentPage(1);
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Filter size={20} className="cursor-pointer hover:text-black" />
      </DialogTrigger>
      <DialogContent className="bg-gray-700">
        <DialogHeader>
          <DialogTitle>Add filter</DialogTitle>
          <DialogDescription className="text-white">
            Add filter for {field}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between gap-2">
            <Button onClick={fetchData} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load Values"
              )}
            </Button>
            <Button onClick={clearAll}>Clear All</Button>
          </div>
          <Input
            placeholder="Search values..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-600 text-white"
          />
          <div className="overflow-y-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow></TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-white">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedValues.map((value, index) => (
                    <TableRow
                      key={index}
                      className="cursor-pointer hover:bg-gray-600"
                      onClick={() => toggleSelection(value)}
                    >
                      <TableCell className="w-[10px]">
                        <Checkbox checked={selectedValues.includes(value)} />
                      </TableCell>
                      <TableCell
                        className="text-white w-full text-ellipsis break-all"
                        title={value}
                      >
                        {value}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center text-white">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </Button>
          </div>
          <p className="text-wrap break-all">
            Selected values: {`[${selectedValues}]`}
          </p>
          <Button onClick={handleSubmit} className="mt-4">
            Apply Filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
