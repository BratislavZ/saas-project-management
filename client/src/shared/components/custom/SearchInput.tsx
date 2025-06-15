"use client";

import { cn } from "@/shared/utils/tailwind";
import { SearchIcon } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";

type Props = {
  value?: string;
  setValue: (value: string) => void;
  placeholder?: string;
};

const SearchInput = ({ setValue, value, placeholder = "Search..." }: Props) => {
  return (
    <div className={cn("relative max-w-sm w-40 lg:w-56")}>
      <SearchIcon className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-8 pr-10 h-8"
      />
    </div>
  );
};

export default SearchInput;
