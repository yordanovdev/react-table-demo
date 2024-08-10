import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ITableGlobalFilter {
  filter?: IGlobalFilter;
}

export interface IGlobalFilter {
  filterValue: string;
  onFilterChange: (updateFilterValue: string) => void;
}

let timer: NodeJS.Timeout;

export function TableGlobalFilter(props: Readonly<ITableGlobalFilter>) {
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
