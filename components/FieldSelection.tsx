"use  client";

import { useTableStore } from "@/stores/useTableStore";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FieldSelection() {
  const { queryFields } = useTableStore();

  console.log(Object.keys(queryFields));

  return (
    <Accordion type="single" collapsible>
      {Object.keys(queryFields).map((parentKey) => (
        <AccordionItem
          key={parentKey}
          value={parentKey}
          className="w-[200px] border"
        >
          <AccordionTrigger>{String(parentKey)}</AccordionTrigger>
          <AccordionContent>
            {queryFields[parentKey].map((item, index) => (
              <li
                key={`${index}-name`}
                className="flex flex-row justify-between"
              >
                <div>{String(item.name)}</div>
                <div>{String(item.type)}</div>
              </li>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
