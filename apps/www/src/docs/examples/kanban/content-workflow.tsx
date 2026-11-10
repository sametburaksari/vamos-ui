"use client";

import * as React from "react";
import { FileText, Image as ImageIcon, Video } from "lucide-react";
import { Avatar, Badge, Toaster, useFormat } from "@vamos-cms/ui";
import { Kanban, KanbanCardMeta, KanbanCardTitle, applyKanbanMove, type Stage } from "@vamos-cms/ui/sortable";

interface Story {
  id: string;
  title: string;
  stage: string;
  type: "article" | "gallery" | "video";
  author: string;
  section: string;
  publishAt?: string;
}

const stages: Stage[] = [
  { key: "idea", label: "Ideas", tone: "neutral", category: "open", collapsed: true },
  { key: "draft", label: "Draft", tone: "chart-1", category: "active" },
  { key: "review", label: "In review", tone: "warning", category: "active", wipLimit: 3 },
  { key: "scheduled", label: "Scheduled", tone: "info", category: "active" },
  { key: "published", label: "Published", tone: "success", category: "done" },
];

const icons = { article: FileText, gallery: ImageIcon, video: Video };

let seq = 20;

export default function KanbanContentWorkflow() {
  const format = useFormat();
  const [stories, setStories] = React.useState<Story[]>([
    { id: "s1", title: "Ten coastal towns worth the detour", stage: "idea", type: "gallery", author: "Elif Demir", section: "Travel" },
    { id: "s2", title: "Why the four-day week stuck", stage: "draft", type: "article", author: "Tom Becker", section: "Work" },
    { id: "s3", title: "Inside the night market kitchens", stage: "draft", type: "video", author: "Hana Sato", section: "Food" },
    { id: "s4", title: "A beginner's guide to rent caps", stage: "review", type: "article", author: "Elif Demir", section: "Housing" },
    { id: "s5", title: "The city's last bookbinders", stage: "review", type: "gallery", author: "Hana Sato", section: "Culture" },
    { id: "s6", title: "Cycling lanes, one year on", stage: "review", type: "article", author: "Tom Becker", section: "City" },
    { id: "s7", title: "Weekend: what's on", stage: "review", type: "article", author: "Mira Novak", section: "Culture" },
    { id: "s8", title: "Election explainer: the new districts", stage: "scheduled", type: "article", author: "Mira Novak", section: "Politics", publishAt: "2026-11-12T07:00:00Z" },
    { id: "s9", title: "Harbour clean-up, in pictures", stage: "published", type: "gallery", author: "Hana Sato", section: "City" },
  ]);
  return (
    <div className="w-full">
      <Toaster />
      <Kanban
        aria-label="Editorial board"
        stages={stages}
        items={stories}
        cardSize="compact"
        columnWidth="sm"
        getStageKey={(s) => s.stage}
        onMove={(e) => setStories((all) => applyKanbanMove(all, e, { getId: (s) => s.id, getStageKey: (s) => s.stage, update: (s, stage) => ({ ...s, stage }) }))}
        onQuickAdd={(stage, title) =>
          setStories((all) => [...all, { id: `s${++seq}`, title, stage, type: "article", author: "You", section: "Unassigned" }])
        }
        renderCard={(s) => {
          const Icon = icons[s.type];
          return (
            <>
              <KanbanCardTitle className="flex gap-1.5">
                <Icon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" />
                <span>{s.title}</span>
              </KanbanCardTitle>
              <KanbanCardMeta>
                <Badge size="sm" tone="outline">{s.section}</Badge>
                {s.publishAt ? <span className="tabular">{format.dateTime(s.publishAt, { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span> : null}
                <Avatar name={s.author} size="xs" className="ms-auto" />
              </KanbanCardMeta>
            </>
          );
        }}
      />
    </div>
  );
}
