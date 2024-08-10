"use client";

import {
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import { columns, Payment } from "./columns";
import { DataTable } from "./data-table";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const paymentsData: Payment[] = [
  {
    id: "728eg52f",
    amount: 100,
    status: "pending",
    email: "1",
  },
  {
    id: "7283d52f",
    amount: 200,
    status: "pending",
    email: "2",
  },
  {
    id: "728edk2f",
    amount: 200,
    status: "alex",
    email: "3",
  },
  {
    id: "728el52f",
    amount: 200,
    status: "zebra",
    email: "4",
  },
  {
    id: "728et52f",
    amount: 200,
    status: "pending",
    email: "5",
  },
  {
    id: "728fd52f",
    amount: 200,
    status: "pending",
    email: "6",
  },
  {
    id: "728ec52f",
    amount: 200,
    status: "pending",
    email: "7",
  },
];

const getTableData = async (
  paginationState: PaginationState,
  filterValue: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
  const startIdx = paginationState.pageIndex * paginationState.pageSize;
  const data = paymentsData
    .filter((i) => i.status.includes(filterValue))
    .slice(startIdx, startIdx + paginationState.pageSize);
  return data;
};

const PaymentsPage = () => {
  const [filterValue, setFilterValue] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 5,
    pageIndex: 0,
  });

  const { data: tableData, isLoading } = useQuery({
    queryKey: ["table", pagination.pageIndex, pagination.pageSize, filterValue],
    queryFn: () => getTableData(pagination, filterValue),
  });

  const data = tableData as Payment[];

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        onPaginationChange={setPagination}
        totalCount={7}
        pagination={pagination}
        visibility
        rowSelection={{
          rowId: "id",
          selectionValue: rowSelection,
          onRowSelectionChange: setRowSelection,
        }}
        columnFilter={{
          onFilterValuesChange: (values) => console.log(values),
        }}
        globalFilter={{
          filterValue: filterValue,
          onFilterChange: setFilterValue,
        }}
        sorting={{
          sortingState: sorting,
          onSortingChange: setSorting,
        }}
      />
    </div>
  );
};

export default PaymentsPage;
