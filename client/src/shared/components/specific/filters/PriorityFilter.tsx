"use client";

import { parseAsString, useQueryState } from "nuqs";
import React from "react";
import { Option, SelectFilter } from "../../custom/filters/SelectFilter";
import { TICKET_PRIORITIES } from "@/features/tickets/types/TicketPriority";

export const PRIORITY_KEY = "priority";

export function PriorityFilter() {
  const [priority, setPriority] = useQueryState(
    PRIORITY_KEY,
    parseAsString
      .withOptions({
        history: "replace",
        scroll: false,
        shallow: false,
      })
      .withDefault("")
  );

  const mappedPriorities: Option[] = React.useMemo(() => {
    return TICKET_PRIORITIES.map((ticketPriority) => ({
      label: ticketPriority.toLowerCase(),
      value: ticketPriority,
    }));
  }, [TICKET_PRIORITIES]);

  const selectedPriorityOption = React.useMemo(() => {
    return mappedPriorities.find((option) => option.value === priority);
  }, [priority, mappedPriorities]);

  const handlePrioritySelect = (option: Option | undefined) => {
    setPriority(option ? option.value : null);
  };

  return (
    <SelectFilter
      onSelect={handlePrioritySelect}
      options={mappedPriorities}
      selectedOption={selectedPriorityOption}
      title="Priority"
    />
  );
}
