"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileReaderProps {
  onFileSelect: (file: File) => void;
}

const FileReader: React.FC<FileReaderProps> = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      onFileSelect(selectedFile);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">File Reader</h2>
      <div className="mb-4">
        <Label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700"
        >
          Choose a CSV or Parquet file
        </Label>
        <Input
          type="file"
          id="file-upload"
          accept=".csv,.parquet"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button onClick={handleButtonClick} className="mt-2">
          Select File
        </Button>
      </div>
      {fileName && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Selected file: {fileName}</p>
        </div>
      )}
    </div>
  );
};

export default FileReader;
