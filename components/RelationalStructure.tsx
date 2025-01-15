"use client";

import { useFileStore } from "@/stores/useFileStore";
import { useRelationalStore } from "@/stores/useRelationalStore";
import { useTableStore } from "@/stores/useTableStore";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Table Relationships</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <>
          <div className="flex flex-row gap-2">
            <select
              value={selectedPrimaryTable}
              onChange={(e) => setSelectedPrimaryTable(e.target.value)}
              className="bg-black px-2 py-1 border rounded cursor-pointer"
            >
              <option value="">Select primary table</option>
              {files.slice(0, 1).map((file) => (
                <option key={file.name} value={file.name}>
                  {file.name}
                </option>
              ))}
            </select>

            {selectedPrimaryTable && (
              <>
                <select
                  value={selectedPrimaryKey}
                  onChange={(e) => setSelectedPrimaryKey(e.target.value)}
                  className="bg-black px-2 py-1 border rounded cursor-pointer"
                >
                  <option value="">Select primary key</option>
                  {queryFields[selectedPrimaryTable]?.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedForeignTable}
                  onChange={(e) => setSelectedForeignTable(e.target.value)}
                  className="bg-black px-2 py-1 border rounded cursor-pointer"
                >
                  <option value="">Select foreign table</option>
                  {files
                    .filter((f) => f.name !== selectedPrimaryTable)
                    .map((file) => (
                      <option key={file.name} value={file.name}>
                        {file.name}
                      </option>
                    ))}
                </select>

                {selectedForeignTable && (
                  <select
                    value={selectedForeignKey}
                    onChange={(e) => setSelectedForeignKey(e.target.value)}
                    className="bg-black px-2 py-1 border rounded cursor-pointer"
                  >
                    <option value="">Select foreign key</option>
                    {queryFields[selectedForeignTable]?.map((field) => (
                      <option key={field.name} value={field.name}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleApplyRelationship}>
                Apply Relationship
              </Button>
              <Button variant="destructive" onClick={clearRelationships}>
                Clear All
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">
              Current Relationships
            </h3>
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
        </>
      )}
    </div>
  );
}
