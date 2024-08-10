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
import React, { Fragment, useMemo, useState } from "react";
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
  Filter,
} from "lucide-react";

interface CustomTableColumnBase<TData> {
  filter?: TableColumnFilterBase;
}

interface ITableColumnFilterBodyProps {
  value: string;
  onValueChange: (value: string) => void;
}

interface TableColumnFilterBase {
  filterName: string;
  body?: (props: ITableColumnFilterBodyProps) => React.ReactNode;
}

type CustomTableColumn<TData> = CustomTableColumnBase<TData>;

export type TableColumnDef<TData> = ColumnDef<TData> & CustomTableColumn<TData>;

interface DataTableProps<TData> {
  columns: TableColumnDef<TData>[];
  data: TData[];
  pagination: PaginationState;
  totalCount: number;
  loading: boolean;
  globalFilter?: IGlobalFilter;
  columnFilter?: IColumnFilter<TData>;
  visibility?: boolean;
  sorting?: ISorting;
  rowSelection?: IRowSelection<TData>;
  onPaginationChange: OnChangeFn<PaginationState>;
}

interface IColumnFilter<TData> {
  onFilterValuesChange: (filterValues: FilteringStateValues) => void;
}

interface IRowSelection<TData> {
  rowId: keyof TData;
  selectionValue: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
}

interface IGlobalFilter {
  filterValue: string;
  onFilterChange: (updateFilterValue: string) => void;
}

interface ISorting {
  sortingState: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

type FilteringState = {
  [x: string]: {
    value: string;
    active: boolean;
  };
};

type FilteringStateValues = {
  [x: string]: string;
};

let filterTimer: NodeJS.Timeout;

export function DataTable<TData>({
  columns,
  data,
  pagination,
  totalCount,
  loading,
  globalFilter,
  visibility,
  sorting,
  rowSelection,
  columnFilter,
  onPaginationChange,
}: Readonly<DataTableProps<TData>>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [filterValues, setFilterValues] = useState<FilteringState>({});

  const showFilterRow = useMemo(() => {
    const values = Object.values(filterValues);
    const hasActiveFilterValues = values.find((i) => i.active);

    return hasActiveFilterValues;
  }, [filterValues]);

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
    columns: updatedColumns as ColumnDef<TData>[],
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

  const onFilterValueChange = (id: string, value: string) => {
    const prevValue = filterValues[id];
    const newValue = { ...prevValue, value };
    const newValues = { ...filterValues, [id]: newValue };
    setFilterValues(newValues);

    const output = Object.fromEntries(
      Object.entries(newValues).map(([key, { value }]) => [key, value])
    );

    clearTimeout(filterTimer);
    filterTimer = setTimeout(() => {
      columnFilter?.onFilterValuesChange(output);
    }, 500);
  };

  const onToggleFilterActivation = (id: string) => {
    const prevValue = filterValues[id] ?? { active: false, value: "" };
    const newValue = { ...prevValue, active: !prevValue.active };
    setFilterValues((prev) => ({ ...prev, [id]: newValue }));
  };

  const getSortingIcon = (
    direction: SortDirection | false,
    column: Column<TData, unknown>
  ) => {
    switch (direction) {
      case "desc":
        return (
          <ArrowDownUp
            className="cursor-pointer"
            size={"18px"}
            onClick={column.getToggleSortingHandler()}
          />
        );
      case "asc":
        return (
          <ArrowDownNarrowWide
            size={"18px"}
            className="cursor-pointer"
            color="#0073e6"
            onClick={column.getToggleSortingHandler()}
          />
        );
      default:
        return (
          <ArrowUpNarrowWide
            className="cursor-pointer"
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
        {globalFilter && <TableGlobalFilter filter={globalFilter} />}
        {visibility && <VisibilitySelector table={table} />}
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <Fragment key={headerGroup.id}>
              <TableRow>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      <div className="flex gap-2 items-center whitespace-nowrap">
                        <RenderFilterHeaderIcon
                          onToggleFilterActivation={onToggleFilterActivation}
                          filterValues={filterValues}
                          column={header.column}
                        />
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
              {/* filtering row */}
              {showFilterRow && (
                <TableRow>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        <ColumnFilter
                          filterValues={filterValues}
                          onFilterValueChange={onFilterValueChange}
                          column={header.column}
                        />
                      </TableHead>
                    );
                  })}
                </TableRow>
              )}
            </Fragment>
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

interface IRenderFilterHeaderIcon<TData> {
  column: Column<TData>;
  filterValues: FilteringState;
  onToggleFilterActivation: (id: string) => void;
}
function RenderFilterHeaderIcon<TData>(
  props: Readonly<IRenderFilterHeaderIcon<TData>>
) {
  const { column, filterValues, onToggleFilterActivation } = props;
  const columnDef = column.columnDef as TableColumnDef<TData>;

  const index = useMemo(() => {
    return columnDef.filter?.filterName || "";
  }, [columnDef.filter?.filterName]);

  const filterValue = useMemo(() => {
    if (!columnDef.filter) return;
    return filterValues[columnDef.filter?.filterName as string];
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

interface IColumnDataFilter<TData> {
  column: Column<TData>;
  filterValues: FilteringState;
  onFilterValueChange: (id: string, value: string) => void;
}
function ColumnFilter<TData>(props: Readonly<IColumnDataFilter<TData>>) {
  const { column, filterValues, onFilterValueChange } = props;
  const columnDef = column.columnDef as TableColumnDef<TData>;

  const index = useMemo(() => {
    return columnDef.filter?.filterName || "";
  }, [columnDef.filter?.filterName]);

  const filterValue = useMemo(() => {
    if (!columnDef.filter) return;
    return filterValues[columnDef.filter?.filterName as string];
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
  filter?: IGlobalFilter;
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
  columns: TableColumnDef<TData>[];
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
