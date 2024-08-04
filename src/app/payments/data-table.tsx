import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortDirection,
  SortingState,
  Table as TableType,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownNarrowWide,
  ArrowDownUp,
  ArrowUpNarrowWide,
} from "lucide-react";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pagination: PaginationState;
  totalCount: number;
  loading: boolean;
  filter?: IFilter;
  visibility?: boolean;
  sorting?: ISorting;
  rowSelection?: IRowSelection<TData>;
  onPaginationChange: OnChangeFn<PaginationState>;
}

interface IRowSelection<TData> {
  rowId: keyof TData;
  selectionValue: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
}

interface IFilter {
  filterValue: string;
  onFilterChange: (updateFilterValue: string) => void;
}

interface ISorting {
  sortingState: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

export function DataTable<TData>({
  columns,
  data,
  pagination,
  totalCount,
  loading,
  filter,
  visibility,
  sorting,
  rowSelection,
  onPaginationChange,
}: Readonly<DataTableProps<TData>>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const updatedColumns = useMemo(() => {
    if (!rowSelection) return columns;
    const selectionColumn = {
      id: "select",
      cell: (props: { row: Row<TData> }) => (
        <div className="px-1">
          <Checkbox
            {...{
              checked: props.row.getIsSelected(),
              disabled: !props.row.getCanSelect(),
              onCheckedChange: props.row.getToggleSelectedHandler(),
            }}
          />
        </div>
      ),
    };
    return [selectionColumn, ...columns];
  }, [columns, rowSelection]);

  const table = useReactTable({
    data,
    columns: updatedColumns,
    rowCount: totalCount,
    manualPagination: true,
    getRowId: (originalRow: TData, index: number) =>
      rowSelection
        ? (originalRow[rowSelection.rowId] as string)
        : index.toString(),
    sortDescFirst: true,
    enableSorting: !!sorting,
    enableRowSelection: !!rowSelection,
    onSortingChange: sorting?.onSortingChange,
    onPaginationChange,
    onRowSelectionChange: rowSelection?.onRowSelectionChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
      rowSelection: rowSelection?.selectionValue ?? {},
      columnVisibility: columnVisibility,
      sorting: sorting?.sortingState,
    },
  });

  const getSortingIcon = (
    direction: SortDirection | false,
    column: Column<TData, unknown>
  ) => {
    switch (direction) {
      case "desc":
        return (
          <ArrowDownUp
            size={"18px"}
            onClick={column.getToggleSortingHandler()}
          />
        );
      case "asc":
        return (
          <ArrowDownNarrowWide
            size={"18px"}
            color="#0073e6"
            onClick={column.getToggleSortingHandler()}
          />
        );
      default:
        return (
          <ArrowUpNarrowWide
            size={"18px"}
            color="#0073e6"
            onClick={column.getToggleSortingHandler()}
          />
        );
    }
  };

  return (
    <div className="rounded-md border">
      <div className="flex gap-5 items-center w-full justify-between px-5 py-3 bg-slate-50 rounded-md">
        {filter && <TableGlobalFilter filter={filter} />}
        {visibility && <VisibilitySelector table={table} />}
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    <div className="flex gap-1 items-center">
                      {header.column.getCanSort() &&
                        getSortingIcon(
                          header.column.getNextSortingOrder(),
                          header.column
                        )}

                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <CoreTableBody table={table} loading={loading} columns={columns} />
        </TableBody>
      </Table>
      <TablePagination table={table} />
    </div>
  );
}

interface IVisibilitySelector<TData> {
  table: TableType<TData>;
}
function VisibilitySelector<TData>(
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

interface ITablePagination<TData> {
  table: TableType<TData>;
}
function TablePagination<TData>(props: Readonly<ITablePagination<TData>>) {
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

interface ITableGlobalFilter {
  filter?: IFilter;
}

let timer: NodeJS.Timeout;

function TableGlobalFilter(props: Readonly<ITableGlobalFilter>) {
  const { filter } = props;

  const [filterPreValue, setFilterPreValue] = useState<string>(
    filter?.filterValue ?? ""
  );

  const handleOnChange = (value: string) => {
    setFilterPreValue(value);
    clearTimeout(timer);
    timer = setTimeout(() => {
      filter?.onFilterChange(value);
    }, 300);
  };
  return (
    filter && (
      <div className="w-96">
        <Input
          placeholder="Global filter"
          value={filterPreValue}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      </div>
    )
  );
}

interface ICoreTableBody<TData> {
  loading: boolean;
  columns: ColumnDef<TData>[];
  table: TableType<TData>;
}
function CoreTableBody<TData>(props: Readonly<ICoreTableBody<TData>>) {
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
