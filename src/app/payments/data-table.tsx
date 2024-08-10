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
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { Fragment, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowDownNarrowWide,
  ArrowDownUp,
  ArrowUpNarrowWide,
} from "lucide-react";
import { ColumnFilter } from "./column-filter";
import { RenderFilterHeaderIcon } from "./table-filter-header-icon";
import { VisibilitySelector } from "./table-visibility-selector";
import { TablePagination } from "./table-paginator";
import { IGlobalFilter, TableGlobalFilter } from "./table-global-filter";
import { CoreTableBody } from "./table-body";

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

interface ISorting {
  sortingState: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

export type FilteringState = {
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
