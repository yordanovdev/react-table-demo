import { TableCell, TableRow } from "@/components/ui/table";
import { TableColumnDef } from "./data-table";
import { flexRender, Table as TableType } from "@tanstack/react-table";

export interface ICoreTableBody<TData> {
  loading: boolean;
  columns: TableColumnDef<TData>[];
  table: TableType<TData>;
}
export function CoreTableBody<TData>(props: Readonly<ICoreTableBody<TData>>) {
  const { table, loading, columns } = props;

  if (loading) return <TableLoadingRow />;

  if (!table?.getRowModel().rows.length) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results.
        </TableCell>
      </TableRow>
    );
  }

  return table.getRowModel()?.rows?.map((row) => (
    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ));
}

const TableLoadingRow = () => {
  return (
    <TableRow>
      <TableCell>
        <h1 className="text-center">Content is loading here</h1>
      </TableCell>
    </TableRow>
  );
};
