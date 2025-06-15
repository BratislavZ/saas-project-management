import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/lib/paths";
import { ArrowLeftIcon } from "lucide-react";
import { Params } from "next/dist/server/request/params";
import Link from "next/link";
import React from "react";
import { z } from "zod";

type Props = {
  params: Promise<Params>;
  children: React.ReactNode;
};

const paramsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
  projectId: z.coerce.number().int().positive(),
});

export default async function ProjectIdSettingsLayout({
  children,
  params,
}: Props) {
  const { organizationId, projectId } = await paramsSchema.parseAsync(
    await params
  );

  return (
    <div className="grid space-y-6">
      <Link
        href={PATHS.EMPLOYEE.projectId(organizationId, projectId)}
        className="w-fit"
      >
        <Button variant={"outline"} type="button" size={"sm"}>
          <ArrowLeftIcon />
          Project board
        </Button>
      </Link>
      {children}
    </div>
  );
}
