"use client";

import * as React from "react";
import { CalendarClock, Eye, ImagePlus } from "lucide-react";
import {
  Badge,
  Button,
  Checkbox,
  EditorBar,
  EditorCanvas,
  EditorLayout,
  EditorPanel,
  EditorPanelSection,
  Input,
  SaveStatus,
  Select,
  Textarea,
  type SaveState,
} from "@vamos-ui/react";

// CMS post editor: publish bar, prose canvas, WordPress-style meta boxes that remember if they're open.
export default function EditorLayoutDemo() {
  const [title, setTitle] = React.useState("Five dishes from our spring menu");
  const [save, setSave] = React.useState<{ state: SaveState; at?: Date }>({ state: "saved", at: new Date(Date.now() - 120_000) });
  const timer = React.useRef<number>(undefined);

  const edit = (value: string) => {
    setTitle(value);
    setSave({ state: "dirty" });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSave({ state: "saving" });
      timer.current = window.setTimeout(() => setSave({ state: "saved", at: new Date() }), 900);
    }, 1200);
  };

  return (
    <div className="h-[640px] w-full overflow-hidden rounded-ui-lg border border-line bg-scene">
      <EditorLayout scroll="panes" shortcuts={false}>
        <EditorBar
          back={{ href: "/site/posts", label: "Posts" }}
          title={title || "Untitled post"}
          status={<SaveStatus state={save.state} at={save.at} guard={false} />}
          secondaryActions={
            <Button size="sm" variant="ghost">
              <Eye /> Preview
            </Button>
          }
          actions={<Button size="sm" variant="primary">Publish</Button>}
          menu={[
            { id: "preview", label: "Preview" },
            { id: "schedule", label: "Schedule…" },
            { id: "history", label: "Revision history" },
            { type: "separator" },
            { id: "trash", label: "Move to trash", tone: "danger" },
          ]}
        />
        <EditorCanvas width="prose">
          <Textarea
            aria-label="Post title"
            rows={2}
            value={title}
            onChange={(e) => edit(e.target.value)}
            className="font-display resize-none border-0 bg-transparent px-0 text-[length:calc(36px*var(--display-scale))] leading-tight shadow-none focus-visible:outline-none"
          />
          <Textarea
            aria-label="Post body"
            rows={12}
            className="resize-none border-0 bg-transparent px-0 text-[16px] leading-[1.75] shadow-none focus-visible:outline-none"
            defaultValue={`Spring at the harbour means the first broad beans, wild garlic from the hills and the season's last blood oranges.\n\nOur kitchen spent six weeks testing what would make it onto the menu. Here are the five dishes we're proudest of — and the small decisions behind each one.\n\n1. Charred broad beans, whipped feta, mint oil`}
          />
        </EditorCanvas>
        <EditorPanel footer={<Button size="sm" variant="danger-ghost" className="-ms-2">Move to trash</Button>}>
          <EditorPanelSection id="demo-status" title="Status & visibility" summary="Draft · Public" defaultOpen>
            <Select aria-label="Visibility" defaultValue="public" items={[{ value: "public", label: "Public" }, { value: "private", label: "Private" }, { value: "password", label: "Password protected" }]} />
            <Button size="sm" className="justify-start">
              <CalendarClock /> Publish immediately
            </Button>
            <Checkbox label="Stick to the top of the blog" />
          </EditorPanelSection>
          <EditorPanelSection id="demo-permalink" title="Permalink" summary="/blog/spring-menu-dishes">
            <Input aria-label="URL slug" defaultValue="spring-menu-dishes" addonStart="/blog/" size="sm" />
          </EditorPanelSection>
          <EditorPanelSection id="demo-categories" title="Categories" summary="Menu, Kitchen notes">
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="accent">Menu</Badge>
              <Badge tone="accent">Kitchen notes</Badge>
              <Badge>Events</Badge>
            </div>
          </EditorPanelSection>
          <EditorPanelSection id="demo-featured" title="Featured image" summary="Not set">
            <button type="button" className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-ui border border-dashed border-field-border text-fg-muted transition-colors hover:bg-hover focus-ring">
              <ImagePlus aria-hidden className="size-5" />
              <span className="text-[12.5px]">Set featured image</span>
            </button>
          </EditorPanelSection>
          <EditorPanelSection id="demo-excerpt" title="Excerpt" summary="Written automatically">
            <Textarea aria-label="Excerpt" rows={3} placeholder="A one-line summary for cards and search results" />
          </EditorPanelSection>
        </EditorPanel>
      </EditorLayout>
    </div>
  );
}
