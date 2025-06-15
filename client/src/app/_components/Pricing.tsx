import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface PricingTierProps {
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  isAuthenticated: boolean;
}

function PricingTier({
  title,
  price,
  features,
  isPopular,
  isAuthenticated,
}: PricingTierProps) {
  return (
    <div
      className={`flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm ${
        isPopular ? "ring-2 ring-primary" : ""
      }`}
    >
      <div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="mt-4 text-4xl font-bold">
          ${price}
          <span className="text-sm font-normal text-muted-foreground">
            /month
          </span>
        </div>
        <ul className="mt-4 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button className="mt-6" asChild>
        <Link href={isAuthenticated ? "/dashboard/billing" : "/sign-up"}>
          {title === "Enterprise" ? "Contact Sales" : "Get Started"}
        </Link>
      </Button>
    </div>
  );
}

interface PricingProps {
  isAuthenticated: boolean;
}

export default function Pricing({ isAuthenticated }: PricingProps) {
  const pricingTiers = [
    {
      title: "Starter",
      price: "9",
      features: [
        "Up to 5 team members",
        "Basic boards and tasks",
        "1GB storage",
      ],
    },
    {
      title: "Pro",
      price: "29",
      features: [
        "Up to 20 team members",
        "Advanced boards and reporting",
        "10GB storage",
        "Time tracking",
      ],
      isPopular: true,
    },
    {
      title: "Enterprise",
      price: "99",
      features: [
        "Unlimited team members",
        "Custom workflows",
        "Unlimited storage",
        "Priority support",
        "Advanced security",
      ],
    },
  ];

  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container @container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-[85rem] text-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Pricing
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Choose the plan that's right for your team. All plans include a
              14-day free trial.
            </p>
          </div>

          <div className="mt-16 grid gap-8 @md:grid-cols-2 @xl:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <PricingTier
                key={index}
                title={tier.title}
                price={tier.price}
                features={tier.features}
                isPopular={tier.isPopular}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
