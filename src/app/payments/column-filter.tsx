import { Column } from "@tanstack/react-table";
import { FilteringState, TableColumnDef } from "./data-table";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";

interface IColumnDataFilter<TData> {
  column: Column<TData>;
  filterValues: FilteringState;
  onFilterValueChange: (id: string, value: string) => void;
}
export function ColumnFilter<TData>(props: Readonly<IColumnDataFilter<TData>>) {
  const { column, filterValues, onFilterValueChange } = props;
  const columnDef = column.columnDef as TableColumnDef<TData>;

  const index = useMemo(() => {
    return columnDef.filter?.filterName ?? "";
  }, [columnDef.filter?.filterName]);

  const filterValue = useMemo(() => {
    if (!columnDef.filter) return;
    return filterValues[columnDef.filter?.filterName];
  }, [filterValues, columnDef.filter]);

  if (!columnDef.filter) return;

  return (
    filterValue?.active && (
      <div className="py-3 w-min">
        {columnDef.filter?.body ? (
          columnDef.filter.body({
            value: filterValue.value,
            onValueChange: (value: string) => onFilterValueChange(index, value),
          })
        ) : (
          <Input
            placeholder={`Enter ${index}`}
            className="w-fit"
            value={filterValue?.value}
            onChange={(e) => onFilterValueChange(index, e.target.value)}
          />
        )}
      </div>
    )
  );
}
