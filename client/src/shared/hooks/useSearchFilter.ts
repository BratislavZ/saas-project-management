import { parseAsString, useQueryState, UseQueryStateOptions } from "nuqs";
import React from "react";
import { useDebouncedCallback } from "./useDebouncedCallback";

export const SEARCH_TERM_KEY = "searchTerm";
export const DEBOUNCE_MS = 300;

type Props = {
  queryStateOptions?: Omit<UseQueryStateOptions<string>, "parse">;
  onDebounceChange?: (value: string) => void;
};

export function useSearchFilter({ onDebounceChange }: Props = {}) {
  const [urlValue, setUrlValue] = useQueryState(
    SEARCH_TERM_KEY,
    parseAsString
      .withOptions({
        history: "replace",
        clearOnDefault: false,
        scroll: false,
        shallow: false,
      })
      .withDefault("")
  );

  const [value, setValue] = React.useState(urlValue);

  React.useEffect(() => {
    setValue(urlValue);
  }, [urlValue]);

  const debouncedSetUrlValue = useDebouncedCallback((value: string) => {
    void onDebounceChange?.(value || "");
    void setUrlValue(value || null);
  }, DEBOUNCE_MS);

  const handleValueChange = (value: string) => {
    setValue(value);
    debouncedSetUrlValue(value);
  };

  return {
    value,
    handleValueChange,
  };
}
