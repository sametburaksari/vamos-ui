import { Building2, Rocket, Sparkles } from "lucide-react";
import { Badge, Field, RadioGroup, RadioGroupItem } from "@vamos-ui/react";

export default function RadioGroupCard() {
  return (
    <Field label="Plan" hint="Prices exclude VAT. Switch or cancel any time.">
      <RadioGroup variant="card" orientation="horizontal" name="plan" defaultValue="team" className="w-full max-w-3xl">
        <RadioGroupItem value="starter" icon={<Rocket />} label="Starter" description="Up to 3 seats, one website.">
          <span className="font-display text-2xl">$19</span>
          <span className="text-xs text-fg-subtle"> / month</span>
        </RadioGroupItem>
        <RadioGroupItem value="team" icon={<Sparkles />} label="Team" description="Up to 25 seats, CRM and invoicing.">
          <span className="font-display text-2xl">$79</span>
          <span className="text-xs text-fg-subtle"> / month</span>
          <Badge tone="accent" className="ms-2 align-middle">
            Most popular
          </Badge>
        </RadioGroupItem>
        <RadioGroupItem value="business" icon={<Building2 />} label="Business" description="Unlimited seats, SSO and audit log.">
          <span className="font-display text-2xl">$249</span>
          <span className="text-xs text-fg-subtle"> / month</span>
        </RadioGroupItem>
      </RadioGroup>
    </Field>
  );
}
