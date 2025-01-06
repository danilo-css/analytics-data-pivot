import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePivotStore } from "@/stores/usePivotStore";

export function SelectAggregation() {
  const { aggregation, setAggregation } = usePivotStore();
  return (
    <>
      {aggregation.type && aggregation.table && aggregation.name && (
        <Select
          value={aggregation.type}
          onValueChange={(value: typeof aggregation.type) =>
            aggregation.table && aggregation.name
              ? setAggregation(aggregation.table, aggregation.name, value)
              : null
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select an aggregation" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="SUM" className="cursor-pointer">
                SUM
              </SelectItem>
              <SelectItem value="AVG" className="cursor-pointer">
                AVG
              </SelectItem>
              <SelectItem value="MIN" className="cursor-pointer">
                MIN
              </SelectItem>
              <SelectItem value="MAX" className="cursor-pointer">
                MAX
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </>
  );
}
