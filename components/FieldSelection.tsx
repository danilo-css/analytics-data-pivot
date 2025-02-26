"use  client";

import { useTableStore } from "@/stores/useTableStore";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "./ui/badge";
import { TbNumber123 } from "react-icons/tb";
import { PiTextAaFill } from "react-icons/pi";
import { Clock, Columns3, Database, Rows3, SquareSigma } from "lucide-react";
import { useFileStore } from "@/stores/useFileStore";
import { usePivotStore } from "@/stores/usePivotStore";
import FilterDialog from "./FilterDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

function DateOptionsDialog({ table, field }: { table: string; field: string }) {
  const { addRow, addColumn } = usePivotStore();

  const options = [
    { label: "Year", extract: "YEAR" },
    { label: "Month", extract: "MONTH" },
    { label: "Quarter", extract: "QUARTER" },
  ] as const;

  return (
    <Dialog>
      <DialogTrigger>
        <Clock size={20} className="cursor-pointer hover:text-black" />
      </DialogTrigger>
      <DialogContent className="bg-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Date parsing</DialogTitle>
          <DialogDescription className="text-white">
            {`Date parse "${field}" from "${table}". Do notice the field has to be in the format YYYY-MM-DD.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 p-4">
          <h4 className="font-medium leading-none">Date Field Options</h4>
          <div className="flex flex-col gap-2">
            {options.map((opt) => (
              <div
                key={opt.extract}
                className="flex justify-between items-center"
              >
                <span>{opt.label}</span>
                <div className="flex gap-1">
                  <Rows3
                    size={20}
                    className="cursor-pointer hover:text-black"
                    onClick={() => addRow(table, field, opt.extract)}
                  />
                  <Columns3
                    size={20}
                    className="cursor-pointer hover:text-black"
                    onClick={() => addColumn(table, field, opt.extract)}
                  />
                  <FilterDialog
                    table={table}
                    field={field}
                    dateExtract={opt.extract}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FieldSelection() {
  const { queryFields, setQueryFields, isLoadingFields } = useTableStore();
  const { files } = useFileStore();
  const { addRow, addColumn, setAggregation } = usePivotStore();

  const handleTypeChange = (parentKey: string, itemIndex: number) => {
    const updatedFields = [...queryFields[parentKey]];
    updatedFields[itemIndex].type =
      updatedFields[itemIndex].type === "Utf8" ? "Float" : "Utf8";
    setQueryFields(parentKey, updatedFields);
  };

  return (
    <Accordion type="single" collapsible className="overflow-y-auto">
      {files?.map((parentKey: File, index: number) => (
        <AccordionItem
          key={parentKey.name}
          value={parentKey.name}
          className="w-full border px-4 rounded-lg"
        >
          <AccordionTrigger className="flex flex-row gap-2">
            <div className="relative">
              <Database />
              <span className="absolute -bottom-[6px] -right-[6px] text-xs bg-black px-1 rounded-md">
                {index}
              </span>
            </div>
            <div className="text-ellipsis break-words max-w-[200px]">
              {parentKey.name}
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1 overflow-y-auto max-h-[400px] px-1">
            {isLoadingFields ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : (
              queryFields[parentKey.name]?.map((item, index) => (
                <Badge
                  key={`${index}-name`}
                  className="flex flex-row justify-between"
                >
                  <div
                    className="text-ellipsis overflow-hidden w-[150px]"
                    title={item.name}
                  >
                    {item.name}
                  </div>
                  <div>
                    <div className="flex flex-row gap-1 items-center">
                      {item.type === "Utf8" ? (
                        <>
                          <PiTextAaFill
                            size={24}
                            onClick={() =>
                              handleTypeChange(parentKey.name, index)
                            }
                            className="cursor-pointer hover:text-black"
                            title="Current format: Text. Click to change to number or date."
                          />
                          <Rows3
                            size={20}
                            className="cursor-pointer hover:text-black"
                            onClick={() => addRow(parentKey.name, item.name)}
                          />
                          <Columns3
                            size={20}
                            className="cursor-pointer hover:text-black"
                            onClick={() => addColumn(parentKey.name, item.name)}
                          />
                          <FilterDialog
                            table={parentKey.name}
                            field={item.name}
                          />
                        </>
                      ) : (
                        <>
                          <TbNumber123
                            size={24}
                            onClick={() =>
                              handleTypeChange(parentKey.name, index)
                            }
                            title="Current format: Number. Click to change to text."
                            className="cursor-pointer hover:text-black"
                          />
                          <DateOptionsDialog
                            table={parentKey.name}
                            field={item.name}
                          />
                          <SquareSigma
                            size={20}
                            className="cursor-pointer hover:text-black"
                            onClick={() =>
                              setAggregation(parentKey.name, item.name, "SUM")
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                </Badge>
              ))
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
