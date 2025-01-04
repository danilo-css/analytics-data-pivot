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
import { Columns3, Filter, Rows3, SquareSigma } from "lucide-react";
import { useFileStore } from "@/stores/useFileStore";

export default function FieldSelection() {
  const { queryFields, setQueryFields } = useTableStore();
  const { files } = useFileStore();

  const handleTypeChange = (parentKey: string, itemIndex: number) => {
    const updatedFields = [...queryFields[parentKey]];
    updatedFields[itemIndex].type =
      updatedFields[itemIndex].type === "Utf8" ? "Float" : "Utf8";
    setQueryFields(parentKey, updatedFields);
  };

  return (
    <Accordion type="single" collapsible>
      {files?.map((parentKey: File) => (
        <AccordionItem
          key={parentKey.name}
          value={parentKey.name}
          className="w-full border px-4 rounded-lg"
        >
          <AccordionTrigger>{parentKey.name}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1 overflow-y-auto max-h-[400px]">
            {queryFields[parentKey.name]?.map((item, index) => (
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
                          className="cursor-pointer"
                          title="Current format: Text. Click to change to number."
                        />
                        <Rows3
                          size={20}
                          className="cursor-pointer hover:text-blue-500"
                        />
                        <Columns3
                          size={20}
                          className="cursor-pointer hover:text-blue-500"
                        />
                        <Filter
                          size={20}
                          className="cursor-pointer hover:text-blue-500"
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
                          className="cursor-pointer hover:text-blue-500"
                        />
                        <SquareSigma
                          size={20}
                          className="cursor-pointer hover:text-blue-500"
                        />
                      </>
                    )}
                  </div>
                </div>
              </Badge>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
