"use client";

import { useProjectMembersPromise } from "@/features/project-members/providers/ProjectMembersProvider";
import { parseAsString, useQueryState } from "nuqs";
import React from "react";
import { Option, SelectFilter } from "../../custom/filters/SelectFilter";

export const ASSIGNEE_KEY = "assigneeId";

export function AssigneeFilter() {
  const allProjectMembers = React.use(useProjectMembersPromise());

  const [assigneeId, setAssigneeId] = useQueryState(
    ASSIGNEE_KEY,
    parseAsString
      .withOptions({
        history: "replace",
        scroll: false,
        shallow: false,
      })
      .withDefault("")
  );

  const mappedMembers: Option[] = React.useMemo(() => {
    return allProjectMembers.map((member) => ({
      label: member.name,
      value: member.id.toString(),
    }));
  }, [allProjectMembers]);

  const selectedMemberOption = React.useMemo(() => {
    return mappedMembers.find((option) => option.value === assigneeId);
  }, [assigneeId, mappedMembers]);

  const handleMemberSelect = (option: Option | undefined) => {
    setAssigneeId(option ? option.value : null);
  };

  return (
    <SelectFilter
      onSelect={handleMemberSelect}
      options={mappedMembers}
      selectedOption={selectedMemberOption}
      title="Assignee"
    />
  );
}
