import React from "react";

import Link from "next/link";
import { cn } from "@/shared/utils/tailwind";

import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
};

export const commonNavItemClasses = {
  base: "flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
  active: "bg-main-200 text-primary shadow-sm font-semibold",
  inactive: "text-dark-800 hover:bg-main-100 hover:text-dark-900",
};

export const commonIconClasses = {
  base: "h-4 w-4 transition-transform duration-200",
  active: "text-primary",
};

type NavItemProps = {
  item: NavigationItem;
};

export function NavItem({ item }: NavItemProps) {
  const pathname = usePathname();

  const isActive = item.isActive ?? pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        commonNavItemClasses.base,
        isActive ? commonNavItemClasses.active : commonNavItemClasses.inactive
      )}
    >
      <item.icon
        className={cn(
          commonIconClasses.base,
          isActive && commonIconClasses.active
        )}
      />
      {item.title}
    </Link>
  );
}

type NavBarProps = {
  items: NavigationItem[];
};

export function NavBar({ items }: NavBarProps) {
  return (
    <nav className="flex items-center space-x-4">
      {items.map((item) => (
        <NavItem key={item.title} item={item} />
      ))}
    </nav>
  );
}
