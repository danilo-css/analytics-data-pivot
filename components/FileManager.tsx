"use client";

import React, { useRef } from "react";
import { useFileStore } from "@/stores/useFileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FileManager() {
  const { files, addFile, removeFile } = useFileStore();
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
      <div className="mb-4">
        <Label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700"
        >
          Choose a CSV, Excel, or Parquet file
        </Label>
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
      </div>
      {files.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.name}>
                <TableCell>{file.name}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => removeFile(file.name)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
