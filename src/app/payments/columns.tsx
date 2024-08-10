"use client";

import { TableColumnDef } from "./data-table";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed" | "alex" | "zebra";
  email: string;
};

export const columns: TableColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
    filter: {
      filterName: "status",
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    filter: {
      filterName: "amount",
    },
  },
  {
    accessorKey: "custom",
    header: "Custom Body",
    cell: (rowData) => {
      const row = rowData.row.original;
      return <div>Hello {row.email}</div>;
    },
  },
];
