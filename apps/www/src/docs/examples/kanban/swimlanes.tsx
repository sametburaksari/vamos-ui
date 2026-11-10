"use client";

import * as React from "react";
import { Avatar, Badge } from "@vamos-ui/react";
import { Kanban, KanbanCardMeta, KanbanCardTitle, applyKanbanMove, type KanbanLane, type Stage } from "@vamos-ui/react/sortable";

interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: string;
  recruiter: string;
  source: "Referral" | "LinkedIn" | "Careers page";
}

const stages: Stage[] = [
  { key: "applied", label: "Applied", tone: "chart-1" },
  { key: "screen", label: "Phone screen", tone: "chart-2" },
  { key: "interview", label: "Interview", tone: "chart-3", wipLimit: 2 },
  { key: "offer", label: "Offer", tone: "chart-5" },
  { key: "hired", label: "Hired", tone: "success", category: "done" },
];

const lanes: KanbanLane[] = [
  { key: "dilan", label: "Dilan Çelik", icon: <Avatar name="Dilan Çelik" size="xs" /> },
  { key: "owen", label: "Owen Price", icon: <Avatar name="Owen Price" size="xs" /> },
];

const initial: Candidate[] = [
  { id: "c1", name: "Aylin Yıldız", role: "Product designer", stage: "applied", recruiter: "dilan", source: "Careers page" },
  { id: "c2", name: "Jakub Nowak", role: "Backend engineer", stage: "screen", recruiter: "dilan", source: "Referral" },
  { id: "c3", name: "Grace Liu", role: "Backend engineer", stage: "interview", recruiter: "dilan", source: "LinkedIn" },
  { id: "c4", name: "Samuel Adeyemi", role: "Data analyst", stage: "interview", recruiter: "owen", source: "Referral" },
  { id: "c5", name: "Ines Moreau", role: "Account executive", stage: "offer", recruiter: "owen", source: "LinkedIn" },
  { id: "c6", name: "Kenji Watanabe", role: "Support lead", stage: "applied", recruiter: "owen", source: "Careers page" },
  { id: "c7", name: "Lucía Herrera", role: "Product designer", stage: "hired", recruiter: "dilan", source: "Referral" },
];

export default function KanbanSwimlanes() {
  const [people, setPeople] = React.useState(initial);
  return (
    <Kanban
      aria-label="Recruiting pipeline by recruiter"
      stages={stages}
      lanes={lanes}
      items={people}
      cardSize="compact"
      columnWidth="sm"
      getStageKey={(c) => c.stage}
      getLaneKey={(c) => c.recruiter}
      getLabel={(c) => c.name}
      onMove={(e) =>
        setPeople((all) =>
          applyKanbanMove(all, e, {
            getId: (c) => c.id,
            getStageKey: (c) => c.stage,
            getLaneKey: (c) => c.recruiter,
            update: (c, stage, lane) => ({ ...c, stage, recruiter: lane ?? c.recruiter }),
          }),
        )
      }
      renderCard={(c) => (
        <>
          <KanbanCardTitle>{c.name}</KanbanCardTitle>
          <KanbanCardMeta>
            <span className="truncate">{c.role}</span>
            {c.source === "Referral" ? <Badge size="sm" tone="accent">Referral</Badge> : null}
          </KanbanCardMeta>
        </>
      )}
    />
  );
}
