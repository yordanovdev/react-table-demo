import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table as TableType } from "@tanstack/react-table";
import { useMemo } from "react";

interface IVisibilitySelector<TData> {
  table: TableType<TData>;
}

export function VisibilitySelector<TData>(
  props: Readonly<IVisibilitySelector<TData>>
) {
  const { table } = props;
  const allColumns = useMemo(() => table.getAllColumns(), [table]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Toggle Columns</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="flex items-center gap-3 pb-3">
          <Checkbox onCheckedChange={() => table.toggleAllColumnsVisible()} />
          <p className="font-medium">Toggle all columns</p>
        </DropdownMenuLabel>
        {allColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={() => column.toggleVisibility()}
          >
            {column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
