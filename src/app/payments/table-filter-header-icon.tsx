import { Column } from "@tanstack/react-table";
import { FilteringState, TableColumnDef } from "./data-table";
import { useMemo } from "react";
import { Filter } from "lucide-react";

interface IRenderFilterHeaderIcon<TData> {
  column: Column<TData>;
  filterValues: FilteringState;
  onToggleFilterActivation: (id: string) => void;
}
export function RenderFilterHeaderIcon<TData>(
  props: Readonly<IRenderFilterHeaderIcon<TData>>
) {
  const { column, filterValues, onToggleFilterActivation } = props;
  const columnDef = column.columnDef as TableColumnDef<TData>;

  const index = useMemo(() => {
    return columnDef.filter?.filterName ?? "";
  }, [columnDef.filter?.filterName]);

  const filterValue = useMemo(() => {
    if (!columnDef.filter) return;
    return filterValues[columnDef.filter?.filterName];
  }, [filterValues, columnDef.filter]);

  if (!columnDef.filter) return;

  return filterValue?.active ? (
    <Filter
      className="cursor-pointer"
      size={"18px"}
      color="#0073e6"
      onClick={() => onToggleFilterActivation(index)}
    />
  ) : (
    <Filter
      className="cursor-pointer"
      size={"18px"}
      onClick={() => onToggleFilterActivation(index)}
    />
  );
}
