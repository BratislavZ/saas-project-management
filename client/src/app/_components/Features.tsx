import { CheckCircle2 } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col justify-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      title: "Agile Boards",
      description:
        "Create customizable boards with drag-and-drop functionality to visualize your workflow.",
    },
    {
      title: "Time Tracking",
      description:
        "Track time spent on tasks and generate reports to improve productivity and billing.",
    },
    {
      title: "Reporting & Analytics",
      description:
        "Get insights into your team's performance with customizable dashboards and reports.",
    },
    {
      title: "Team Collaboration",
      description:
        "Work together seamlessly with real-time updates, comments, and file sharing.",
    },
    {
      title: "Automation",
      description:
        "Automate repetitive tasks and workflows to save time and reduce errors.",
    },
    {
      title: "Integrations",
      description:
        "Connect with your favorite tools like Slack, GitHub, and Google Drive.",
    },
  ];

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container mx-auto @container px-4 md:px-6">
        <div className="mx-auto max-w-[85rem] text-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              TaskFlow provides all the tools your team needs to plan, track,
              and deliver amazing results.
            </p>
          </div>

          <div className="mt-16 grid gap-8 @md:grid-cols-2 @xl:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
