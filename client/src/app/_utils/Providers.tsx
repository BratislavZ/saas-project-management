// app/providers.tsx
"use client";

import { Toaster } from "@/shared/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <Toaster />
        {children}
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
