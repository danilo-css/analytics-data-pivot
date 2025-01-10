"use client";

import { useFileStore } from "@/stores/useFileStore";
import { useRelationalStore } from "@/stores/useRelationalStore";
import { useTableStore } from "@/stores/useTableStore";
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Trash2 } from "lucide-react";

export default function RelationalStructure() {
  const { files } = useFileStore();
  const {
    relationships,
    addRelationship,
    removeRelationship,
    clearRelationships,
  } = useRelationalStore();
  const { queryFields } = useTableStore();

  const [selectedPrimaryTable, setSelectedPrimaryTable] = useState<string>("");
  const [selectedForeignTable, setSelectedForeignTable] = useState<string>("");
  const [selectedPrimaryKey, setSelectedPrimaryKey] = useState<string>("");
  const [selectedForeignKey, setSelectedForeignKey] = useState<string>("");

  const handleApplyRelationship = () => {
    if (
      selectedPrimaryTable &&
      selectedForeignTable &&
      selectedPrimaryKey &&
      selectedForeignKey
    ) {
      addRelationship({
        primary_table: selectedPrimaryTable,
        primary_key: selectedPrimaryKey,
        foreign_table: selectedForeignTable,
        foreign_key: selectedForeignKey,
      });
      // Reset selections
      setSelectedPrimaryKey("");
      setSelectedForeignKey("");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">Table Relationships</h2>

      <div className="flex flex-row gap-2">
        <Select
          value={selectedPrimaryTable}
          onValueChange={setSelectedPrimaryTable}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select primary table" />
          </SelectTrigger>
          <SelectContent>
            {files.slice(0, 1).map((file) => (
              <SelectItem
                key={file.name}
                value={file.name}
                className="cursor-pointer"
              >
                {file.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPrimaryTable && (
          <>
            <Select
              value={selectedPrimaryKey}
              onValueChange={setSelectedPrimaryKey}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary key" />
              </SelectTrigger>
              <SelectContent>
                {queryFields[selectedPrimaryTable]?.map((field) => (
                  <SelectItem
                    key={field.name}
                    value={field.name}
                    className="cursor-pointer"
                  >
                    {field.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedForeignTable}
              onValueChange={setSelectedForeignTable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select foreign table" />
              </SelectTrigger>
              <SelectContent>
                {files
                  .filter((f) => f.name !== selectedPrimaryTable)
                  .map((file) => (
                    <SelectItem
                      key={file.name}
                      value={file.name}
                      className="cursor-pointer"
                    >
                      {file.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedForeignTable && (
              <Select
                value={selectedForeignKey}
                onValueChange={setSelectedForeignKey}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select foreign key" />
                </SelectTrigger>
                <SelectContent>
                  {queryFields[selectedForeignTable]?.map((field) => (
                    <SelectItem
                      key={field.name}
                      value={field.name}
                      className="cursor-pointer"
                    >
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={handleApplyRelationship}>Apply Relationship</Button>
          <Button variant="destructive" onClick={clearRelationships}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-md font-semibold mb-2">Current Relationships</h3>
        {relationships.map((rel, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 border rounded mb-2"
          >
            <div className="flex flex-row gap-2">
              {rel.primary_table}🔑{rel.primary_key} ➜ {rel.foreign_table}🔑
              {rel.foreign_key}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeRelationship(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
