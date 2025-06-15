"use client";

import { FileWarningIcon } from "lucide-react";
import { SheetTitle } from "../../ui/sheet";

const SheetErrorContent = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4 p-6">
      <SheetTitle className="text-xl font-semibold text-center">
        Error
      </SheetTitle>

      <div className="flex flex-col items-center justify-center gap-5">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-red-100 rounded-full blur-lg opacity-60 animate-pulse" />

          {/* Icon container */}
          <div className="relative bg-white dark:bg-gray-800 rounded-full p-5 border border-red-200 dark:border-red-800 shadow-sm">
            <FileWarningIcon className="h-12 w-12 text-red-500" />
          </div>
        </div>

        {/* Error message with improved typography */}
        <div className="text-center">
          <p className="text-base font-medium text-muted-foreground">
            Failed to load content
          </p>
        </div>
      </div>
    </div>
  );
};

export default SheetErrorContent;
