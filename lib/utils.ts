import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTypeForColumn(
  schema: Record<string, { name: string; type: string }[]>,
  fileName: string,
  columnName: string
): string | undefined {
  const fileSchema = schema[fileName];
  const column = fileSchema?.find((col) => col.name === columnName);
  return column?.type;
}
