import { create } from "zustand";

type FileStoreType = {
  files: File[];
  addFile: (file: File) => void;
  removeFile: (fileName: string) => void;
};

export const useFileStore = create<FileStoreType>((set) => ({
  files: [],
  addFile: (file: File) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  removeFile: (fileName: string) =>
    set((state) => ({
      files: state.files.filter((file) => file.name !== fileName),
    })),
}));
