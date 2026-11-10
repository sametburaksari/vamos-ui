import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge, Card } from "@vamos-ui/react";

const deals = [
  { company: "Moda Wellness", value: "$4,500", stage: "Proposal sent", tone: "info" },
  { company: "Kadıköy Bistro", value: "$1,280 / mo", stage: "Negotiation", tone: "warning" },
] as const;

export default function CardInteractiveLink() {
  // The whole card is one link: exactly one interactive element inside.
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      {deals.map((d) => (
        <Card key={d.company} asChild interactive padding="md">
          <Link href="/docs/components/card#interactive-link" className="group grid gap-3">
            <span className="flex items-start justify-between">
              <span className="text-[15px] font-semibold">{d.company}</span>
              <ArrowUpRight className="size-4 text-fg-subtle transition-colors group-hover:text-fg" />
            </span>
            <span className="font-mono text-2xl tracking-[-0.02em] tabular">{d.value}</span>
            <Badge tone={d.tone} dot className="justify-self-start">
              {d.stage}
            </Badge>
          </Link>
        </Card>
      ))}
    </div>
  );
}
