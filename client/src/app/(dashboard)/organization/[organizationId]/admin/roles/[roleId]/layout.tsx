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
});

export default async function RuleIdLayout(props: Props) {
  const { organizationId } = await paramsSchema.parseAsync(await props.params);

  return (
    <div className="grid space-y-6">
      <Link
        href={PATHS.ORGANIZATION_ADMIN.roles(organizationId)}
        className="w-fit"
      >
        <Button variant={"outline"} type="button" size={"sm"}>
          <ArrowLeftIcon />
          Roles
        </Button>
      </Link>
      {props.children}
    </div>
  );
}
