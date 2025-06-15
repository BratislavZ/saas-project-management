import { cn } from "@/shared/utils/tailwind";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-dark-100 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
