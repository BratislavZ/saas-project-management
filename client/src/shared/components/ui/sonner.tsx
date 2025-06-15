"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = () => {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "w-full flex items-center gap-3 p-4 text-sm font-medium rounded-lg border",
          error:
            "bg-red-200 text-destructive-foreground border-none text-red-700",
          success: "bg-green-200 text-green-700 border-none",
          warning: "bg-warning text-warning-foreground border-warning",
          info: "bg-info text-info-foreground border-info",
          default: "bg-background text-foreground border-border",
        },
      }}
    />
  );
};

export { Toaster };
