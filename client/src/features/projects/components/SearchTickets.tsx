"use client";

import SearchInput from "@/shared/components/custom/SearchInput";
import { useSearchFilter } from "@/shared/hooks/useSearchFilter";
import React from "react";

const SearchTickets = () => {
  const { handleValueChange, value } = useSearchFilter();

  return (
    <SearchInput
      value={value}
      setValue={handleValueChange}
      placeholder="Search tickets"
    />
  );
};

export default SearchTickets;
