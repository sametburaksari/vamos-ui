"use client";

import * as React from "react";
import { Building2, Mail, Phone } from "lucide-react";
import { Badge, HoverCard, HoverCardContent, HoverCardTrigger, Skeleton, SkeletonText } from "@vamos-cms/ui";

interface Contact {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  lastActivity: string;
  stage: string;
}

// Stand-in for your API call.
const fetchContact = () =>
  new Promise<Contact>((resolve) =>
    setTimeout(
      () =>
        resolve({
          name: "Amelia Hart",
          role: "Head of Procurement",
          company: "Northwind Logistics",
          email: "amelia.hart@northwind.co",
          phone: "+44 20 7946 0321",
          lastActivity: "Replied to proposal · 2 h ago",
          stage: "Negotiation",
        }),
      800,
    ),
  );

export default function HoverCardEntity() {
  const [contact, setContact] = React.useState<Contact | null>(null);
  return (
    <div className="flex items-center gap-2 text-sm text-fg-muted">
      Deal owner:
      <HoverCard
        onOpenChange={(open) => {
          // fetch on first open, keep the result
          if (open && !contact) fetchContact().then(setContact);
        }}
      >
        <HoverCardTrigger href="/crm/contacts/482" className="font-medium text-fg hover:underline underline-offset-4 focus-ring">
          Amelia Hart
        </HoverCardTrigger>
        <HoverCardContent>
          {contact ? (
            <div className="grid gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-fg">{contact.name}</p>
                  <p className="text-[13px] text-fg-muted">{contact.role}</p>
                </div>
                <Badge tone="warning">{contact.stage}</Badge>
              </div>
              <dl className="grid gap-1.5 text-[13px] text-fg-muted [&_dt]:sr-only [&_dd]:flex [&_dd]:items-center [&_dd]:gap-2 [&_svg]:size-3.5 [&_svg]:text-fg-subtle">
                <dt>Company</dt>
                <dd>
                  <Building2 /> {contact.company}
                </dd>
                <dt>Email</dt>
                <dd>
                  <Mail /> {contact.email}
                </dd>
                <dt>Phone</dt>
                <dd className="tabular">
                  <Phone /> {contact.phone}
                </dd>
              </dl>
              <p className="border-t border-line pt-2.5 text-xs text-fg-subtle">{contact.lastActivity}</p>
            </div>
          ) : (
            <div className="grid gap-3" aria-busy="true">
              <div className="grid gap-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <SkeletonText lines={3} />
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
