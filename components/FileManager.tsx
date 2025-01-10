"use client";

import React, { useRef, useState } from "react";
import { useFileStore } from "@/stores/useFileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTableStore } from "@/stores/useTableStore";
import { usePivotStore } from "@/stores/usePivotStore";
import { usePyodideStore } from "@/stores/usePyodideStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Spinner = () => (
  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

export default function FileManager() {
  const { files, addFile, removeFile } = useFileStore();
  const { clearQueryFields } = useTableStore();
  const { pyodide } = usePyodideStore();
  const {
    clearFileRows,
    clearFileColumns,
    clearFileAggregation,
    clearFileFilters,
  } = usePivotStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [currentXlsxFile, setCurrentXlsxFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".xlsx")) {
        setCurrentXlsxFile(selectedFile);
        const sheetNames = await getSheetNames(selectedFile);
        setSheets(sheetNames);
        setIsDialogOpen(true);
      } else if (selectedFile.name.endsWith(".parquet")) {
        addFile(selectedFile);
      }
      event.target.value = "";
    }
    setIsLoading(false);
  };

  const getSheetNames = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Write to virtual filesystem instead of passing data through JSON
    pyodide?.FS.writeFile("/tmp/excel_file.xlsx", uint8Array);

    const result = await pyodide?.runPythonAsync(`
      import pandas as pd
      
      xl = pd.ExcelFile('/tmp/excel_file.xlsx')
      sheet_names = xl.sheet_names
      sheet_names
    `);

    // Cleanup
    pyodide?.FS.unlink("/tmp/excel_file.xlsx");

    return result.toJs();
  };

  const convertToParquet = async (sheet: string) => {
    if (!currentXlsxFile) return;
    setIsConverting(true);

    const arrayBuffer = await currentXlsxFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Write to virtual filesystem
    pyodide?.FS.writeFile("/tmp/excel_file.xlsx", uint8Array);

    const result = await pyodide?.runPythonAsync(`
      import pandas as pd
      import pyarrow as pa
      import pyarrow.parquet as pq
      import io
      
      df = pd.read_excel('/tmp/excel_file.xlsx', sheet_name='${sheet}')
      table = pa.Table.from_pandas(df)
      
      output_buffer = io.BytesIO()
      pq.write_table(table, output_buffer)
      output_buffer.getvalue()
    `);

    // Cleanup
    pyodide?.FS.unlink("/tmp/excel_file.xlsx");

    const uint8ArrayResult = new Uint8Array(result.toJs());
    const blob = new Blob([uint8ArrayResult], {
      type: "application/octet-stream",
    });
    const parquetFileName = `${currentXlsxFile.name.replace(
      ".xlsx",
      ""
    )}-${sheet}.parquet`;

    // Create a link element, set its href to the blob URL, and click it to trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = parquetFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsConverting(false);
    setIsDialogOpen(false);
    setCurrentXlsxFile(null);
    setSelectedSheet("");
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-4">
      {(isLoading || isConverting) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <Spinner />
        </div>
      )}
      <div className="flex flex-col items-center">
        <Input
          id="file-upload"
          type="file"
          accept=".parquet,.xlsx"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button onClick={handleButtonClick} className="mt-2">
          Select File
        </Button>
        <p className="text-xs">.parquet, .xlsx</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black">
          <DialogHeader>
            <DialogTitle>Select Sheet</DialogTitle>
          </DialogHeader>
          <Select onValueChange={setSelectedSheet} value={selectedSheet}>
            <SelectTrigger>
              <SelectValue placeholder="Select a sheet" />
            </SelectTrigger>
            <SelectContent>
              {sheets.map((sheet) => (
                <SelectItem key={sheet} value={sheet}>
                  {sheet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => selectedSheet && convertToParquet(selectedSheet)}
            disabled={!selectedSheet || isConverting}
          >
            {isConverting ? <Spinner /> : "Convert to Parquet"}
          </Button>
        </DialogContent>
      </Dialog>

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
                  clearFileFilters(file.name);
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
