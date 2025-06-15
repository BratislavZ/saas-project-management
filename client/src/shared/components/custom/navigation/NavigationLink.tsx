"use client";

import { cn } from "@/shared/utils/tailwind";
import Link from "next/link";
import React from "react";

type NavigationLinkProps = {
  href: string;
  title: string;
  isActive: boolean;
};

function NavigationLink({ href, title, isActive }: NavigationLinkProps) {
  const activeStyle = cn(
    "border border-main-100 shadow-colorized text-main-800 bg-gradient-to-b from-main-50 to-main-100"
  );

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg text-sm px-3 py-1.5 text-dark-900 hover:bg-dark-50",
        isActive && activeStyle
      )}
    >
      <span className={cn("font-semibold", isActive && "text-main-500")}>
        {title}
      </span>
    </Link>
  );
}

export default NavigationLink;
