import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type CallToActionProps = {
  isAuthenticated: boolean;
};

export default function CallToAction({ isAuthenticated }: CallToActionProps) {
  return (
    <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto  px-4 md:px-6">
        <div className="mx-auto max-w-[85rem] text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Transform Your Workflow?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Join thousands of teams who are already using TaskFlow to deliver
              amazing results.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href={isAuthenticated ? "/dashboard" : "/sign-up"}>
                {isAuthenticated ? "Go to Dashboard" : "Start Your Free Trial"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
