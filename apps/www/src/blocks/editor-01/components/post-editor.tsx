"use client";

import * as React from "react";
import { Eye, History } from "lucide-react";
import {
  Badge,
  Button,
  DateTimePicker,
  EditorBar,
  EditorCanvas,
  EditorLayout,
  EditorPanel,
  EditorPanelContent,
  EditorPanelSection,
  Field,
  Input,
  SaveStatus,
  Select,
  SlugInput,
  Switch,
  TagInput,
  Textarea,
  TreeSelect,
  toast,
  useFormat,
  type SaveState,
} from "@vamos-ui/react";
import { BlockEditor, countWords, docToPlainText } from "@vamos-ui/react/editor";
import { createMemoryAdapter, ImageField, LengthMeter, LinkPreviewTabs, MediaProvider, type ImageFieldValue } from "@vamos-ui/react/media";
import type { VamosDoc } from "@vamos-ui/react/blocks/schema";
import { authors, categories, coverAsset, initialDoc, initialTitle, libraryAssets, SITE, tagSuggestions } from "./data";

const visibilityItems = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private — editors only" },
  { value: "password", label: "Password protected" },
];

/** CMS post editor: publish bar, block editor canvas, Post and SEO panels. */
export function PostEditor() {
  const f = useFormat();
  const [adapter] = React.useState(() => createMemoryAdapter({ seed: libraryAssets, latency: 0 }));

  const [title, setTitle] = React.useState(initialTitle);
  const [doc, setDoc] = React.useState<VamosDoc>(initialDoc);
  const [words, setWords] = React.useState(() => countWords(docToPlainText(initialDoc)));
  const [slug, setSlug] = React.useState("spring-menu-2027");
  const [visibility, setVisibility] = React.useState("public");
  const [publishAt, setPublishAt] = React.useState<string | null>("2026-11-14T09:00");
  const [featured, setFeatured] = React.useState(true);
  const [author, setAuthor] = React.useState("elif");
  const [cats, setCats] = React.useState<string[]>(["menu-seasonal", "kitchen"]);
  const [tags, setTags] = React.useState<string[]>(["Spring", "Seasonal", "Garden"]);
  const [cover, setCover] = React.useState<ImageFieldValue | null>({ asset: coverAsset });
  const [excerpt, setExcerpt] = React.useState("Broad beans, wild garlic and the season's last blood oranges: the twelve plates on our new spring menu, served from 1 March.");
  const [seoTitle, setSeoTitle] = React.useState("Spring Menu 2027: Twelve New Plates | Kalamış Bistro");
  const [seoDescription, setSeoDescription] = React.useState("Asparagus, wild garlic and the first broad beans: our chef walks you through the new spring menu, served from 1 March at the marina.");

  // Simulated autosave: dirty → saving → saved.
  const [save, setSave] = React.useState<{ state: SaveState; at?: Date }>(() => ({ state: "saved", at: new Date(Date.now() - 2 * 60_000) }));
  const timer = React.useRef<number | undefined>(undefined);
  const touch = React.useCallback(() => {
    setSave({ state: "dirty" });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSave({ state: "saving" });
      timer.current = window.setTimeout(() => setSave({ state: "saved", at: new Date() }), 700);
    }, 1200);
  }, []);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    touch();
  };

  const readMinutes = Math.max(1, Math.round(words / 220));
  const url = `${SITE.url}/journal/${slug}`;
  const catLabel = cats.length ? `${cats.length} selected` : "Uncategorised";
  const scheduled = publishAt ? `Scheduled · ${f.date(publishAt.slice(0, 10), "medium")}, ${publishAt.slice(11, 16)}` : "Publish immediately";

  return (
    <MediaProvider adapter={adapter}>
      <EditorLayout scroll="panes" resizable defaultPanelWidth={360} className="h-dvh">
        <EditorBar
          back={{ href: "/site/posts", label: "Posts" }}
          title={title || "Untitled post"}
          status={<SaveStatus state={save.state} at={save.at} guard={false} />}
          secondaryActions={
            <Button size="sm" variant="ghost" onClick={() => toast(`Preview opened · ${url}`)}>
              <Eye /> Preview
            </Button>
          }
          actions={
            <Button size="sm" variant="primary" onClick={() => toast.success(publishAt ? "Post scheduled" : "Post published")}>
              {publishAt ? "Schedule" : "Publish"}
            </Button>
          }
          menu={[
            { id: "preview", label: "Preview", onSelect: () => toast(`Preview opened · ${url}`) },
            { id: "history", label: "Revision history", icon: <History /> },
            { id: "duplicate", label: "Duplicate post" },
            { type: "separator" },
            { id: "trash", label: "Move to trash", tone: "danger" },
          ]}
        />

        <EditorCanvas width="prose">
          <Textarea
            aria-label="Post title"
            rows={2}
            value={title}
            onChange={(e) => edit(setTitle)(e.target.value)}
            placeholder="Add a title"
            className="font-display resize-none border-0 bg-transparent px-0 text-[length:calc(38px*var(--display-scale))] leading-[1.1] tracking-[-0.01em] shadow-none focus-visible:outline-none"
          />
          <div className="mb-4 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-fg-subtle">
            <span className="tabular">{f.number(words)} words</span>
            <span aria-hidden>·</span>
            <span>{readMinutes} min read</span>
            <span aria-hidden>·</span>
            <span>Type / to add a block</span>
          </div>
          <BlockEditor
            value={doc}
            onChange={(next, info) => {
              setDoc(next);
              setWords(info.wordCount);
              touch();
            }}
            variant="document"
            aria-label="Post body"
          />
        </EditorCanvas>

        <EditorPanel
          defaultValue="post"
          tabs={[
            { id: "post", label: "Post" },
            { id: "seo", label: "SEO" },
          ]}
          footer={<Button size="sm" variant="danger-ghost" className="-ms-2">Move to trash</Button>}
        >
          <EditorPanelContent value="post">
            <EditorPanelSection id="editor-01-status" title="Publish" summary={`${visibility === "public" ? "Public" : visibility === "private" ? "Private" : "Password"} · ${scheduled}`} defaultOpen>
              <Field label="Visibility">
                <Select size="sm" value={visibility} onValueChange={(v) => v && edit(setVisibility)(v)} items={visibilityItems} />
              </Field>
              <Field label="Publish at" hint="Empty publishes immediately. Times are Istanbul time.">
                <DateTimePicker size="sm" value={publishAt} onValueChange={edit(setPublishAt)} step={15} hourCycle={24} timeZone="Europe/Istanbul" clearable />
              </Field>
              <Field label="Author">
                <Select size="sm" value={author} onValueChange={(v) => v && edit(setAuthor)(v)} items={authors} />
              </Field>
              <label className="flex items-center justify-between gap-3 text-[13px]">
                Feature on the home page
                <Switch checked={featured} onCheckedChange={edit(setFeatured)} />
              </label>
            </EditorPanelSection>

            <EditorPanelSection id="editor-01-permalink" title="Permalink" summary={`/journal/${slug}`}>
              <SlugInput variant="permalink" source={title} value={slug} onValueChange={edit(setSlug)} prefix={`${SITE.url.replace("https://", "")}/journal/`} defaultLocked />
            </EditorPanelSection>

            <EditorPanelSection id="editor-01-categories" title="Categories" summary={catLabel} defaultOpen>
              <TreeSelect multiple nodes={categories} value={cats} onValueChange={edit(setCats)} placeholder="Add category" searchPlaceholder="Search categories…" aria-label="Add category" />
            </EditorPanelSection>

            <EditorPanelSection id="editor-01-tags" title="Tags" summary={tags.length ? tags.join(", ") : "None"}>
              <TagInput value={tags} onValueChange={edit(setTags)} suggestions={tagSuggestions} placeholder="Add a tag…" aria-label="Tags" />
            </EditorPanelSection>

            <EditorPanelSection id="editor-01-featured" title="Featured image" summary={cover ? cover.asset.filename : "Not set"} defaultOpen>
              <ImageField aspect="16/9" value={cover} onChange={edit(setCover)} recommended={{ width: 1200, height: 630 }} requireAlt />
            </EditorPanelSection>

            <EditorPanelSection id="editor-01-excerpt" title="Excerpt" summary={excerpt ? "Written" : "Generated from the first paragraph"}>
              <Textarea aria-label="Excerpt" rows={3} value={excerpt} onChange={(e) => edit(setExcerpt)(e.target.value)} placeholder="A one-line summary for cards and feeds" />
              <LengthMeter value={excerpt} max={200} label="Excerpt length" />
            </EditorPanelSection>
          </EditorPanelContent>

          <EditorPanelContent value="seo">
            <EditorPanelSection id="editor-01-seo" title="Search appearance" summary={seoTitle} defaultOpen>
              <Field label="SEO title">
                <Input size="sm" value={seoTitle} onChange={(e) => edit(setSeoTitle)(e.target.value)} />
              </Field>
              <LengthMeter value={seoTitle} field="title" label="SEO title length" className="-mt-1" />
              <Field label="Meta description">
                <Textarea rows={4} value={seoDescription} onChange={(e) => edit(setSeoDescription)(e.target.value)} />
              </Field>
              <LengthMeter value={seoDescription} field="description" label="Meta description length" className="-mt-1" />
            </EditorPanelSection>
            <EditorPanelSection id="editor-01-preview" title="Link preview" summary={<Badge tone="success" dot>Ready to share</Badge>} defaultOpen>
              <LinkPreviewTabs
                size="sm"
                highlight="spring menu"
                data={{
                  url,
                  title: seoTitle,
                  description: seoDescription,
                  siteName: SITE.name,
                  publishedAt: publishAt ? publishAt.slice(0, 10) : undefined,
                  breadcrumbs: ["Journal", "Menu"],
                  image: cover?.asset ?? null,
                }}
              />
            </EditorPanelSection>
          </EditorPanelContent>
        </EditorPanel>
      </EditorLayout>
    </MediaProvider>
  );
}
