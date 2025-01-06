import { useFileStore } from "@/stores/useFileStore";
import { usePivotStore } from "@/stores/usePivotStore";

export default function QueryBuilder() {
  const { rows, columns, aggregation } = usePivotStore();
  const { files } = useFileStore();

  if (files.length === 0) {
    return null;
  } else if (files.length === 1) {
    const row_list = rows.map((row) => row.name);
    const column_list = columns.map((column) => column.name);
    const all_fields = [...new Set([...row_list, ...column_list])];
    const all_fields_string = all_fields
      .map((field) => `'${field}'`)
      .join(", ");

    return `
        SELECT ${all_fields_string}, ${aggregation.type}(${aggregation.name}) 
        FROM '${files[0].name}' 
        GROUP BY ${all_fields_string}
        `;
  }
}
