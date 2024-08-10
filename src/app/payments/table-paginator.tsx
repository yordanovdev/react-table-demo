import { Button } from "@/components/ui/button";
import { Table as TableType } from "@tanstack/react-table";

interface ITablePagination<TData> {
  table: TableType<TData>;
}
export function TablePagination<TData>(
  props: Readonly<ITablePagination<TData>>
) {
  const { table } = props;
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  );
}
