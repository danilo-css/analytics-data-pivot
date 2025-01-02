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

export default function FieldSelection() {
  const { queryFields, setQueryFields } = useTableStore();

  const handleTypeChange = (parentKey: string, itemIndex: number) => {
    const updatedFields = [...queryFields[parentKey]];
    updatedFields[itemIndex].type =
      updatedFields[itemIndex].type === "Utf8" ? "Float" : "Utf8";
    setQueryFields(parentKey, updatedFields);
  };

  return (
    <Accordion type="single" collapsible>
      {Object.keys(queryFields).map((parentKey) => (
        <AccordionItem
          key={parentKey}
          value={parentKey}
          className="w-[200px] border"
        >
          <AccordionTrigger className="text-wrap">{parentKey}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            {queryFields[parentKey].map((item, index) => (
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
                  {item.type === "Utf8" ? (
                    <PiTextAaFill
                      size={24}
                      onClick={() => handleTypeChange(parentKey, index)}
                      className="cursor-pointer"
                      title="Current format: Text. Click to change to number."
                    />
                  ) : (
                    <TbNumber123
                      size={24}
                      onClick={() => handleTypeChange(parentKey, index)}
                      className="cursor-pointer"
                      title="Current format: Number. Click to change to text."
                    />
                  )}
                </div>
              </Badge>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
