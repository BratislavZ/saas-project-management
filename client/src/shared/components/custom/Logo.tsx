"use client";

import { PATHS } from "@/shared/lib/paths";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Logo = () => {
  const router = useRouter();

  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => router.push(PATHS.PUBLIC.home)}
    >
      <Image
        src="/logo.svg?height=32&width=32"
        alt="Logo"
        width={32}
        height={32}
        className="rounded"
      />
      <span className="text-xl font-bold">TaskFlow</span>
    </div>
  );
};
