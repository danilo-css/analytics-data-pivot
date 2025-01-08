"use client";

import React, { useRef } from "react";
import { useFileStore } from "@/stores/useFileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTableStore } from "@/stores/useTableStore";
import { usePivotStore } from "@/stores/usePivotStore";

export default function FileManager() {
  const { files, addFile, removeFile } = useFileStore();
  const { clearQueryFields } = useTableStore();
  const { clearFileRows, clearFileColumns, clearFileAggregation } =
    usePivotStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      addFile(selectedFile);
      // Reset the input value to allow the same file to be selected again
      event.target.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <Input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.parquet"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button onClick={handleButtonClick} className="mt-2">
          Select File
        </Button>
        <p className="text-xs">.parquet, .xlsx or .csv</p>
      </div>
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex justify-between items-center p-2 border rounded"
            >
              <span
                className="text-ellipsis overflow-hidden w-[200px] text-xs"
                title={file.name}
              >
                {file.name}
              </span>
              <Button
                onClick={() => {
                  removeFile(file.name);
                  clearQueryFields(file.name);
                  clearFileRows(file.name);
                  clearFileColumns(file.name);
                  clearFileAggregation(file.name);
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
