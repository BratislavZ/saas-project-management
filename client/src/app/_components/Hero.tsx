import { Button } from "@/shared/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  isAuthenticated: boolean;
}

export default function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="w-full py-12 md:py-20 ">
      <div className="container mx-auto @container px-4 md:px-6">
        <div className="mx-auto max-w-[85rem] text-center">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Streamline Your Projects with TaskFlow
            </h1>
            <p className="mt-4 max-w-[700px] text-muted-foreground text-lg md:text-xl">
              The all-in-one project management solution that helps teams
              collaborate, track progress, and deliver results.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href={isAuthenticated ? "/dashboard" : "/sign-up"}>
                  {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 mx-auto max-w-5xl">
            <Image
              src="/kanban.png"
              width={1100}
              height={550}
              alt="Dashboard Preview"
              className="rounded-xl border shadow-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
