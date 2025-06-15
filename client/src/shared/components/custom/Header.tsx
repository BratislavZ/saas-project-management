"use client";

import { PropsWithChildren, ReactNode } from "react";
import { Logo } from "./Logo";
import { UserButton } from "./UserButton";
import { Separator } from "../ui/separator";

export const Header = ({ children }: PropsWithChildren) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {children}
    </header>
  );
};

export const DashboardHeader = ({ children }: { children?: ReactNode }) => {
  return (
    <Header>
      <div className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Logo />
          {children && (
            <Separator
              orientation="vertical"
              className="mx-0.5 data-[orientation=vertical]:h-6"
            />
          )}
          {children}
        </div>
        <UserButton />
      </div>
    </Header>
  );
};
