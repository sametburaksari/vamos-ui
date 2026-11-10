"use client";

import * as React from "react";
import { useEditorState } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { MousePointerClick, PackageX, Settings2 } from "lucide-react";
import { cn } from "../lib/cn";
import { slugify } from "../lib/text";
import { Field, Input, Textarea } from "../components/input";
import { Switch } from "../components/switch";
import { NativeSelect } from "../components/native-select";
import { Button } from "../components/button";
import { ToggleGroup, ToggleGroupItem } from "../components/toggle";
import { useBlockEditor } from "./context";
import { COMPONENT_BLOCK } from "./convert";
import { setNodeAttrs } from "./commands";
import { iconForBlock } from "./items";
import { SchemaForm, type SchemaFieldHints, type WidgetComponent } from "./schema-form";

export interface BlockInspectorProps {
  className?: string;
  /** Custom SchemaForm widgets. */
  widgets?: Record<string, WidgetComponent>;
  /** Shown with no selection: a button that switches the side panel to document settings. */
  onShowDocument?: () => void;
  /** Label of that button. Default "Document settings". */
  documentLabel?: string;
}

/**
 * Settings of the selected block, generated from its zod schema (SchemaForm): variant, every
 * prop with its `f.*` widget, anchor and visibility. Images get alt text, caption and
 * "decorative". Field errors come straight from validation. Put it in an `EditorPanel` tab.
 */
export function BlockInspector({ className, widgets, onShowDocument, documentLabel = "Document settings" }: BlockInspectorProps) {
  const { editor, registry, t, lang, readOnly } = useBlockEditor();
  const sel = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      const s = e.state.selection;
      if (!(s instanceof NodeSelection)) return null;
      const name = s.node.type.name;
      if (name !== COMPONENT_BLOCK && name !== "image") return null;
      return { pos: s.from, name, attrs: s.node.attrs as Record<string, unknown> };
    },
    equalityFn: (a, b) => a?.pos === b?.pos && a?.attrs === b?.attrs,
  });

  const update = (patch: Record<string, unknown>) => {
    if (editor && sel) setNodeAttrs(editor, sel.pos, patch);
  };

  if (!sel) {
    return (
      <div data-slot="block-inspector" className={cn("vui-inspector vui-inspector-empty", className)}>
        <MousePointerClick aria-hidden className="size-5 text-fg-subtle" />
        <p className="text-sm font-medium text-fg">{t("noSelection")}</p>
        <p className="text-xs text-fg-muted">{t("noSelectionHint")}</p>
        {onShowDocument ? (
          <Button size="xs" variant="ghost" onClick={onShowDocument} className="mt-1">
            <Settings2 aria-hidden />
            {documentLabel}
          </Button>
        ) : null}
      </div>
    );
  }

  if (sel.name === "image") {
    const a = sel.attrs;
    return (
      <div data-slot="block-inspector" className={cn("vui-inspector", className)}>
        <InspectorHeader title={t("image")} meta="image" />
        <div className="flex flex-col gap-3.5">
          <Field label={t("altText")} hint={t("altTextHint")} error={!a.decorative && !String(a.alt ?? "").trim() && a.src ? t("missingAlt") : undefined}>
            <Textarea rows={2} value={(a.alt as string) ?? ""} disabled={readOnly || !!a.decorative} onChange={(e) => update({ alt: e.target.value })} />
          </Field>
          <Field orientation="horizontal" label={t("decorative")}>
            <Switch size="sm" checked={!!a.decorative} disabled={readOnly} onCheckedChange={(c) => update({ decorative: c || null })} />
          </Field>
          <Field label={t("caption")}>
            <Input size="sm" value={(a.caption as string) ?? ""} disabled={readOnly} onChange={(e) => update({ caption: e.target.value || null })} />
          </Field>
          <Field label={t("imageUrl")}>
            <Input size="sm" value={(a.src as string) ?? ""} disabled={readOnly} onChange={(e) => update({ src: e.target.value || null })} />
          </Field>
        </div>
      </div>
    );
  }

  const type = String(sel.attrs.blockType ?? "");
  const def = registry.get(type);
  if (!def) {
    return (
      <div data-slot="block-inspector" className={cn("vui-inspector", className)}>
        <InspectorHeader title={t("unknownBlock", { type })} meta={type} icon={<PackageX className="size-4" />} />
        <p className="text-xs text-fg-muted">{t("unknownBlockHint")}</p>
        <pre className="vui-inspector-json">{JSON.stringify(sel.attrs.props ?? {}, null, 2)}</pre>
      </div>
    );
  }

  const props = (sel.attrs.props ?? {}) as Record<string, unknown>;
  const variant = (sel.attrs.variant as string | null) ?? def.defaultVariant ?? def.variants?.[0];
  const parsed = def.schema.safeParse(props);
  const Icon = iconForBlock(def.icon);
  const variants = def.variants ?? [];

  return (
    <div data-slot="block-inspector" className={cn("vui-inspector", className)}>
      <InspectorHeader title={def.title} meta={`${def.type} · v${def.version}`} icon={<Icon className="size-4" />} description={def.description} />
      {variants.length > 1 ? (
        <Field label={t("variant")}>
          {variants.length <= 3 ? (
            <ToggleGroup aria-label={t("variant")} size="sm" block value={variant} onValueChange={(v) => v && update({ variant: v })} disabled={readOnly}>
              {variants.map((v) => (
                <ToggleGroupItem key={v} value={v}>
                  {def.variantMeta?.[v]?.label ?? v}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : (
            <NativeSelect size="sm" value={variant} disabled={readOnly} items={variants.map((v) => ({ value: v, label: def.variantMeta?.[v]?.label ?? v }))} onChange={(e) => update({ variant: e.target.value })} />
          )}
        </Field>
      ) : null}
      <SchemaForm
        schema={def.schema}
        value={props}
        onChange={(next) => update({ props: next })}
        fields={def.fields as SchemaFieldHints | undefined}
        widgets={widgets}
        errors={parsed.success ? null : parsed.error.issues}
        variant={variant}
        locale={lang}
        disabled={readOnly}
      />
      {def.supports.anchor !== false ? (
        <section className="vui-sf-section" aria-label={t("advanced")}>
          <h3 className="vui-eyebrow">{t("advanced")}</h3>
          <Field label={t("anchor")} hint={sel.attrs.anchor ? t("anchorHint", { anchor: String(sel.attrs.anchor) }) : undefined}>
            <Input size="sm" addonStart="#" value={(sel.attrs.anchor as string) ?? ""} disabled={readOnly} onChange={(e) => update({ anchor: slugify(e.target.value, { locale: lang }) || null })} />
          </Field>
          <Field orientation="horizontal" label={t("hide")}>
            <Switch size="sm" checked={!!sel.attrs.hidden} disabled={readOnly} onCheckedChange={(c) => update({ hidden: c || null })} />
          </Field>
        </section>
      ) : null}
    </div>
  );
}

function InspectorHeader({ title, meta, icon, description }: { title: string; meta: string; icon?: React.ReactNode; description?: string }) {
  return (
    <header className="vui-inspector-head">
      {icon ? (
        <span aria-hidden className="vui-inspector-icon">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-fg">{title}</h3>
        <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-subtle">{meta}</p>
        {description ? <p className="mt-1 text-xs text-fg-muted">{description}</p> : null}
      </div>
    </header>
  );
}
