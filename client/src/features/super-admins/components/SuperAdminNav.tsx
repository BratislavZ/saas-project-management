"use client";

import { BuildingIcon, UsersIcon } from "lucide-react";
import { PATHS } from "@/shared/lib/paths";
import {
  NavBar,
  NavigationItem,
} from "@/shared/components/custom/navigation/NavBar";

const SUPER_ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Organizations",
    href: PATHS.SUPER_ADMIN.organizations,
    icon: BuildingIcon,
  },
  {
    title: "Admins",
    href: PATHS.SUPER_ADMIN.admins,
    icon: UsersIcon,
  },
];

export function SuperAdminNav() {
  return <NavBar items={SUPER_ADMIN_NAVIGATION_ITEMS} />;
}
