import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDuckDBStore } from "@/stores/useDuckDBStore";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React, { useState, useEffect } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";

type FilterDialogProps = {
  table: string;
  field: string;
  dateExtract?: "YEAR" | "MONTH" | "QUARTER";
};

export default function FilterDialog({
  table,
  field,
  dateExtract,
}: FilterDialogProps) {
  const { toast } = useToast();
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
  const [isOpen, setIsOpen] = useState(false);
  const itemsPerPage = 10;

  const fetchData = async () => {
    if (!db) return;
    setLoading(true);

    try {
      let query;
      // Extract the original field name if it's already a date-extracted field
      const originalField = field.match(/^(YEAR|MONTH|QUARTER)\((.*?)\)$/);
      const actualField = originalField ? originalField[2] : field;
      const actualExtract = originalField ? originalField[1] : dateExtract;

      if (actualExtract) {
        query = `SELECT DISTINCT REPLACE(CAST(EXTRACT(${actualExtract} FROM CAST("${actualField}" AS DATE)) AS VARCHAR), '"', '') as value FROM '${table}' WHERE "${actualField}" IS NOT NULL ORDER BY value`;
      } else {
        query = `SELECT DISTINCT REPLACE("${actualField}", '"', '') as value FROM '${table}' WHERE "${actualField}" IS NOT NULL ORDER BY value`;
      }
      const result = await runQuery(db, query);

      const values = result
        .toArray()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: { value: { toString: () => any } }) => row.value.toString());
      setValues(values);
    } catch (error) {
      console.error("Error fetching filter options:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch filter values. Please make sure this is a proper date or text field.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove the automatic fetching from useEffect since we now have a manual fetch button
  useEffect(() => {
    // Reset selected values when dialog opens
    if (open) {
      // Find the filter checking both regular and date-extracted field names
      const existingFilter = filters.find(
        (f) =>
          f.table === table &&
          (f.field === field || f.field === `${dateExtract}(${field})`)
      );
      setSelectedValues(existingFilter?.values || []);
    }
  }, [open, table, field, dateExtract, filters]);

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
    addFilter(table, field, selectedValues, dateExtract);
    toast({
      title: "Filter Applied",
      description: `Successfully applied filter for ${field}`,
    });
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
      <DialogContent className="bg-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add filter</DialogTitle>
          <DialogDescription className="text-white">
            {dateExtract
              ? `Filter by ${dateExtract.toLowerCase()}s from "${field}" in "${table}"`
              : `Add filter for "${field}" from "${table}"`}
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
          <div className="flex justify-between items-center text-white gap-2">
            <Button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft />
            </Button>
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
            <Button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight />
            </Button>
          </div>
          <Button onClick={handleSubmit} className="mt-4">
            Apply Filter
          </Button>
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-white p-2 hover:bg-gray-600 rounded-md">
              <span>Selected values ({selectedValues.length})</span>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ul className="space-y-1">
                {selectedValues.map((value, index) => (
                  <div key={index}>
                    <Separator orientation="horizontal" />
                    <li
                      className="text-white px-2 py-1 w-full text-ellipsis break-all"
                      title={value}
                    >
                      {value}
                    </li>
                  </div>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
}
