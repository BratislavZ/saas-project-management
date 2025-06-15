"use client";

import { LoaderIcon } from "lucide-react";
import { SheetTitle } from "../../ui/sheet";

const SheetLoadingContent = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <SheetTitle className="hidden" />
      <LoaderIcon className="animate-spin" />
    </div>
  );
};
export default SheetLoadingContent;
