import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  quote: string;
  imageSrc: string;
}

function TestimonialCard({
  name,
  role,
  company,
  quote,
  imageSrc,
}: TestimonialCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm">
      <div>
        <div className="flex items-center gap-4">
          <Image
            src={imageSrc}
            width={40}
            height={40}
            alt={`${name}'s avatar`}
            className="rounded-full"
          />
          <div>
            <h4 className="text-sm font-medium">{name}</h4>
            <p className="text-xs text-muted-foreground">
              {role}, {company}
            </p>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">"{quote}"</p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "Acme Inc",
      quote:
        "TaskFlow has transformed how our team works. We're more organized, efficient, and transparent than ever before.",
      imageSrc: "/women1.jpg",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      company: "TechStart",
      quote:
        "The reporting features in TaskFlow give us incredible insights into our development cycles. Highly recommended!",
      imageSrc: "/men1.jpg",
    },
    {
      name: "Emily Rodriguez",
      role: "Team Lead",
      company: "Global Solutions",
      quote:
        "We've tried many project management tools, but TaskFlow is by far the most intuitive and powerful solution we've used.",
      imageSrc: "/women2.jpg",
    },
  ];

  return (
    <section
      id="testimonials"
      className="w-full py-12 md:py-24 lg:py-32 bg-muted"
    >
      <div className="container @container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-[85rem] text-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Trusted by Teams Worldwide
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              See what our customers have to say about TaskFlow.
            </p>
          </div>

          <div className="mt-16 grid gap-8 @md:grid-cols-2 @xl:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                company={testimonial.company}
                quote={testimonial.quote}
                imageSrc={testimonial.imageSrc}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
