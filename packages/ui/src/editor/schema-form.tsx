"use client";

// SchemaForm: a form generated from a zod object schema + `f.*` metadata + field hints.
// The block inspector uses it; so can item settings, theme settings and form builders.

import * as React from "react";
import type { z } from "zod";
import { ArrowDown, ArrowUp, ChevronRight, Plus, Trash2 } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { getFieldMeta, isLocalizedSchema, schemaKind, unwrapSchema, type FieldMeta } from "../blocks/schema/fields";
import { BLOCK_ICONS } from "../blocks/schema/icons";
import type { RichDoc } from "../blocks/schema/rich-doc";
import { Field, Input, Textarea } from "../components/input";
import { Switch } from "../components/switch";
import { NativeSelect } from "../components/native-select";
import { ToggleGroup, ToggleGroupItem } from "../components/toggle";
import { Button, IconButton } from "../components/button";
import { blockEditorLabels, type BlockEditorLabels } from "./labels";
import { RichTextEditor } from "./block-editor";

/** Per-prop hints (overrides `f.*` metadata). */
export interface SchemaFieldHint {
  widget?: string;
  label?: string;
  help?: string;
  placeholder?: string;
  /** Section: "content" (default), "style" or "advanced". */
  group?: string;
  hidden?: boolean;
  /** Show only when this returns true for the current value. */
  when?: (value: Record<string, unknown>) => boolean;
}
export type SchemaFieldHints = Record<string, SchemaFieldHint | undefined>;

export interface WidgetProps {
  id: string;
  value: unknown;
  onChange: (v: unknown) => void;
  schema: z.ZodType;
  meta?: FieldMeta;
  label: string;
  placeholder?: string;
  invalid: boolean;
  disabled?: boolean;
  /** Content locale for localized fields (already resolved: `value` is the plain value). */
  locale: string;
}
export type WidgetComponent = React.ComponentType<WidgetProps>;

export interface SchemaFormIssue {
  path: PropertyKey[];
  message: string;
}

export interface SchemaFormProps<S extends z.ZodObject = z.ZodObject> {
  schema: S;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  fields?: SchemaFieldHints;
  /** Custom widgets by name (`fields.x.widget` or `f.*({ widget })`). */
  widgets?: Record<string, WidgetComponent>;
  /** Validation issues to show under the fields (`zodError.issues`). */
  errors?: readonly SchemaFormIssue[] | z.ZodError | null;
  /** `"sidebar"` (default): compact stacked fields · `"dialog"`: roomier two-column groups. */
  layout?: "sidebar" | "dialog";
  /** The block's variant: hides fields declared for other variants. */
  variant?: string;
  /** Locale edited in `Localized<T>` values. Default "en". */
  locale?: string;
  disabled?: boolean;
  labels?: Partial<BlockEditorLabels>;
  className?: string;
}

const humanize = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const defOf = (s: z.ZodType) => (unwrapSchema(s) as unknown as { _zod: { def: Record<string, unknown> } })._zod.def;
const isOptional = (s: z.ZodType) => {
  const t = (s as unknown as { _zod: { def: { type: string } } })._zod.def.type;
  return t === "optional" || t === "default" || t === "prefault" || t === "nullable";
};

/** The inner schema of `Localized<T>` (`T | { [locale]: T }`). */
function localizedInner(s: z.ZodType): z.ZodType {
  const options = defOf(s).options as z.ZodType[] | undefined;
  return options?.[0] ?? s;
}
function readLocalized(v: unknown, locale: string): unknown {
  if (v && typeof v === "object" && !Array.isArray(v) && !("type" in (v as object) && (v as { type?: unknown }).type === "doc")) {
    const map = v as Record<string, unknown>;
    if (Object.keys(map).every((k) => /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(k))) return map[locale] ?? map[Object.keys(map)[0]!];
  }
  return v;
}
function writeLocalized(prev: unknown, next: unknown, locale: string): unknown {
  if (prev && typeof prev === "object" && !Array.isArray(prev) && !("type" in (prev as object))) {
    const map = prev as Record<string, unknown>;
    if (Object.keys(map).length && Object.keys(map).every((k) => /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(k))) return { ...map, [locale]: next };
  }
  return next;
}

function enumOptions(s: z.ZodType): string[] {
  const d = defOf(s);
  const entries = d.entries as Record<string, string> | undefined;
  if (entries) return Object.values(entries);
  const values = d.values as unknown[] | undefined;
  return (values ?? []).map(String);
}

function issuesOf(errors: SchemaFormProps["errors"]): readonly SchemaFormIssue[] {
  if (!errors) return [];
  if (Array.isArray(errors)) return errors;
  return (errors as z.ZodError).issues ?? [];
}

interface Ctx {
  t: ReturnType<typeof useLabels<BlockEditorLabels>>;
  widgets?: Record<string, WidgetComponent>;
  issues: readonly SchemaFormIssue[];
  locale: string;
  disabled?: boolean;
  variant?: string;
}

const pathKey = (p: readonly PropertyKey[]) => p.map(String).join(".");
function errorFor(ctx: Ctx, path: readonly PropertyKey[]): string | undefined {
  const k = pathKey(path);
  return ctx.issues.find((i) => pathKey(i.path) === k)?.message;
}

// ---------------------------------------------------------------- built-in widgets

function TextWidget({ id, value, onChange, meta, placeholder, invalid, disabled }: WidgetProps) {
  const v = typeof value === "string" ? value : "";
  if (meta?.multiline || meta?.widget === "textarea")
    return <Textarea id={id} value={v} rows={3} maxLength={meta?.max} placeholder={placeholder} invalid={invalid} disabled={disabled} onChange={(e) => onChange(e.target.value || undefined)} />;
  return <Input id={id} size="sm" value={v} maxLength={meta?.max} showCount={!!meta?.max && meta.max <= 160} placeholder={placeholder} invalid={invalid} disabled={disabled} onChange={(e) => onChange(e.target.value || undefined)} />;
}

function UrlWidget({ id, value, onChange, placeholder, invalid, disabled }: WidgetProps) {
  return <Input id={id} size="sm" type="text" inputMode="url" value={typeof value === "string" ? value : ""} placeholder={placeholder ?? "/page or https://…"} invalid={invalid} disabled={disabled} onChange={(e) => onChange(e.target.value || undefined)} />;
}

function NumberWidget({ id, value, onChange, meta, invalid, disabled }: WidgetProps) {
  return (
    <Input
      id={id}
      size="sm"
      type="number"
      inputMode="decimal"
      min={meta?.min}
      max={meta?.max}
      value={typeof value === "number" ? String(value) : ""}
      invalid={invalid}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      className="tabular"
    />
  );
}

function SelectWidget({ id, value, onChange, schema, label, invalid, disabled, meta }: WidgetProps) {
  const options = meta?.field === "icon" ? [...BLOCK_ICONS] : enumOptions(schema);
  const current = typeof value === "string" ? value : "";
  if (options.length <= 4 && meta?.widget !== "select" && meta?.field !== "icon")
    return (
      <ToggleGroup id={id} aria-label={label} size="sm" block value={current} onValueChange={(v) => v && onChange(v)} disabled={disabled}>
        {options.map((o) => (
          <ToggleGroupItem key={o} value={o} className="capitalize">
            {humanize(o)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  return <NativeSelect id={id} size="sm" value={current} invalid={invalid} disabled={disabled} placeholder={current ? undefined : "—"} items={options.map((o) => ({ value: o, label: humanize(o) }))} onChange={(e) => onChange(e.target.value)} />;
}

function ToggleWidget({ id, value, onChange, disabled, label }: WidgetProps) {
  return <Switch id={id} size="sm" aria-label={label} checked={value === true} disabled={disabled} onCheckedChange={(c) => onChange(c)} />;
}

function RichWidget({ id, value, onChange, placeholder, invalid, disabled }: WidgetProps) {
  return <RichTextEditor id={id} size="sm" minHeight="5.5rem" maxHeight="16rem" value={value as RichDoc | undefined} onChange={(d) => onChange(d)} placeholder={placeholder} invalid={invalid} readOnly={disabled} toolbar />;
}

function JsonWidget({ id, value, onChange, invalid, disabled }: WidgetProps) {
  const [text, setText] = React.useState(() => JSON.stringify(value ?? null, null, 2));
  const [bad, setBad] = React.useState(false);
  return (
    <Textarea
      id={id}
      rows={4}
      value={text}
      invalid={invalid || bad}
      disabled={disabled}
      className="font-mono text-xs"
      onChange={(e) => {
        setText(e.target.value);
        try {
          onChange(JSON.parse(e.target.value));
          setBad(false);
        } catch {
          setBad(true);
        }
      }}
    />
  );
}

const BUILTIN: Record<string, WidgetComponent> = {
  text: TextWidget,
  textarea: TextWidget,
  "inline-text": TextWidget,
  url: UrlWidget,
  number: NumberWidget,
  select: SelectWidget,
  segmented: SelectWidget,
  toggle: ToggleWidget,
  switch: ToggleWidget,
  rich: RichWidget,
  richtext: RichWidget,
  json: JsonWidget,
};

// ---------------------------------------------------------------- field renderer

interface FieldNodeProps {
  ctx: Ctx;
  name: string;
  schema: z.ZodType;
  value: unknown;
  onChange: (v: unknown) => void;
  path: PropertyKey[];
  hint?: SchemaFieldHint;
  /** Inside a list item: tighter heading. */
  nested?: boolean;
}

function widgetFor(schema: z.ZodType, meta: FieldMeta | undefined, hint: SchemaFieldHint | undefined): string {
  if (hint?.widget) return hint.widget;
  if (meta?.widget) return meta.widget;
  switch (meta?.field) {
    case "heading":
    case "text":
      return "text";
    case "rich":
      return "rich";
    case "select":
    case "icon":
      return "select";
    case "toggle":
      return "toggle";
    case "number":
      return "number";
    case "list":
    case "social":
      return "list";
    case "group":
    case "image":
    case "link":
    case "cta":
    case "money":
    case "address":
      return "group";
    case "phone":
    case "date":
      return "text";
  }
  const kind = schemaKind(schema);
  if (kind === "string") return "text";
  if (kind === "number") return "number";
  if (kind === "boolean") return "toggle";
  if (kind === "enum" || kind === "literal") return "select";
  if (kind === "array") return "list";
  if (kind === "object") return "group";
  return "json";
}

function FieldNode({ ctx, name, schema, value, onChange, path, hint, nested }: FieldNodeProps) {
  const id = React.useId();
  const meta = getFieldMeta(schema);
  const localized = isLocalizedSchema(schema);
  const inner = localized ? localizedInner(unwrapSchema(schema)) : unwrapSchema(schema);
  const label = hint?.label ?? meta?.label ?? humanize(name);
  const help = hint?.help ?? meta?.help;
  const placeholder = hint?.placeholder ?? meta?.placeholder;
  const error = errorFor(ctx, path);
  const required = !isOptional(schema);
  if (meta?.variants && ctx.variant && !meta.variants.includes(ctx.variant)) return null;

  const plain = localized ? readLocalized(value, ctx.locale) : value;
  const write = (v: unknown) => onChange(localized ? writeLocalized(value, v, ctx.locale) : v);
  const widget = widgetFor(inner, meta, hint);

  if (widget === "group") return <GroupNode ctx={ctx} label={label} help={help} schema={inner} value={plain} onChange={write} path={path} nested={nested} />;
  if (widget === "list") return <ListNode ctx={ctx} label={label} help={help} schema={inner} meta={meta} value={plain} onChange={write} path={path} error={error} />;

  const Widget = ctx.widgets?.[widget] ?? BUILTIN[widget] ?? JsonWidget;
  const horizontal = widget === "toggle" || widget === "switch";
  return (
    <Field id={id} label={label} hint={help} error={error} required={required && widget !== "toggle"} orientation={horizontal ? "horizontal" : "vertical"}>
      <Widget id={id} value={plain} onChange={write} schema={inner} meta={meta} label={label} placeholder={placeholder} invalid={!!error} disabled={ctx.disabled} locale={ctx.locale} />
    </Field>
  );
}

function GroupNode({ ctx, label, help, schema, value, onChange, path, nested }: { ctx: Ctx; label: string; help?: string; schema: z.ZodType; value: unknown; onChange: (v: unknown) => void; path: PropertyKey[]; nested?: boolean }) {
  const shape = ((unwrapSchema(schema) as unknown as { shape?: Record<string, z.ZodType> }).shape ?? {}) as Record<string, z.ZodType>;
  const obj = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const legendId = React.useId();
  return (
    <fieldset className={cn("vui-sf-group", nested && "is-nested")} aria-labelledby={legendId}>
      <legend id={legendId} className="vui-sf-legend">
        {label}
      </legend>
      {help ? <p className="-mt-1 text-xs text-fg-muted">{help}</p> : null}
      {Object.entries(shape).map(([k, s]) => (
        <FieldNode key={k} ctx={ctx} name={k} schema={s} value={obj[k]} path={[...path, k]} onChange={(v) => onChange(compact({ ...obj, [k]: v }))} nested />
      ))}
    </fieldset>
  );
}

const compact = (o: Record<string, unknown>) => {
  const r: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) r[k] = v;
  return r;
};

function itemSummary(item: unknown): string | null {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return null;
  for (const k of ["title", "q", "label", "name", "heading", "text"]) {
    const v = (item as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) return v;
    if (v && typeof v === "object") {
      const first = Object.values(v as Record<string, unknown>).find((x) => typeof x === "string");
      if (typeof first === "string") return first;
    }
  }
  const link = (item as { link?: { label?: unknown } }).link?.label;
  if (typeof link === "string") return link;
  return null;
}

function ListNode({ ctx, label, help, schema, meta, value, onChange, path, error }: { ctx: Ctx; label: string; help?: string; schema: z.ZodType; meta?: FieldMeta; value: unknown; onChange: (v: unknown) => void; path: PropertyKey[]; error?: string }) {
  const { t } = ctx;
  const element = defOf(schema).element as z.ZodType | undefined;
  const list = Array.isArray(value) ? value : [];
  const [open, setOpen] = React.useState<number | null>(list.length ? 0 : null);
  const headingId = React.useId();
  const max = meta?.max;
  const itemName = (i: number) => (meta?.itemLabel ? meta.itemLabel.replace("{n}", String(i + 1)) : t("itemN", { n: i + 1 }));
  const blank = (): unknown => {
    if (!element) return "";
    const kind = schemaKind(element);
    if (kind === "object") return {};
    if (kind === "string") return "";
    if (kind === "number") return 0;
    return null;
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };

  return (
    <section className="vui-sf-list" aria-labelledby={headingId}>
      <div className="flex items-baseline justify-between gap-2">
        <h4 id={headingId} className="vui-sf-legend">
          {label} <span className="font-normal tabular text-fg-subtle">{list.length}</span>
        </h4>
      </div>
      {help ? <p className="-mt-1 text-xs text-fg-muted">{help}</p> : null}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <ol className="flex flex-col gap-1.5">
        {list.map((item, i) => {
          const name = itemSummary(item) ?? itemName(i);
          const expanded = open === i;
          const panelId = `${headingId}-${i}`;
          const itemError = ctx.issues.some((iss) => pathKey(iss.path).startsWith(pathKey([...path, i])));
          return (
            <li key={i} className="vui-sf-item" data-open={expanded ? "" : undefined} data-invalid={itemError ? "" : undefined}>
              <div className="flex items-center gap-1">
                <button type="button" className="vui-sf-item-head focus-ring" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? null : i)}>
                  <ChevronRight aria-hidden className="size-3.5 shrink-0 text-fg-subtle transition-transform rtl:-scale-x-100" />
                  <span className="truncate">{name}</span>
                </button>
                <IconButton size="xs" label={t("moveItemUp", { label: name })} disabled={i === 0 || ctx.disabled} onClick={() => move(i, -1)}>
                  <ArrowUp />
                </IconButton>
                <IconButton size="xs" label={t("moveItemDown", { label: name })} disabled={i === list.length - 1 || ctx.disabled} onClick={() => move(i, 1)}>
                  <ArrowDown />
                </IconButton>
                <IconButton
                  size="xs"
                  variant="danger-ghost"
                  label={t("removeItem", { label: name })}
                  disabled={ctx.disabled || (meta?.min !== undefined && list.length <= meta.min)}
                  onClick={() => {
                    onChange(list.filter((_, j) => j !== i));
                    setOpen(null);
                  }}
                >
                  <Trash2 />
                </IconButton>
              </div>
              {expanded && element ? (
                <div id={panelId} className="vui-sf-item-body">
                  <FieldNode ctx={ctx} name={itemName(i)} schema={element} value={item} path={[...path, i]} onChange={(v) => onChange(list.map((x, j) => (j === i ? v : x)))} nested />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <Button
        size="xs"
        variant="ghost"
        className="self-start"
        disabled={ctx.disabled || (max !== undefined && list.length >= max)}
        onClick={() => {
          onChange([...list, blank()]);
          setOpen(list.length);
        }}
      >
        <Plus aria-hidden />
        {t("addItem", { label: (meta?.itemLabel ?? label).replace(/\s*\{n\}/, "").toLowerCase() })}
      </Button>
    </section>
  );
}

// ---------------------------------------------------------------- SchemaForm

const GROUP_ORDER = ["content", "style", "advanced"];

/**
 * A form generated from a zod object schema. Widgets come from `f.*` metadata (heading, rich,
 * image, list…), the zod type, or a hint (`fields.title.widget = "textarea"`). Localized fields
 * edit the `locale` entry. Arrays are sortable lists with add / remove / move (keyboard only).
 *
 * ```tsx
 * <SchemaForm schema={faqBlock.schema} value={props} onChange={setProps} errors={result.error} locale="en" />
 * ```
 */
export function SchemaForm<S extends z.ZodObject>({ schema, value, onChange, fields, widgets, errors, layout = "sidebar", variant, locale = "en", disabled, labels, className }: SchemaFormProps<S>) {
  const t = useLabels("blockEditor", blockEditorLabels, labels);
  const ctx: Ctx = { t, widgets, issues: issuesOf(errors), locale, disabled, variant };
  const shape = (schema.shape ?? {}) as Record<string, z.ZodType>;
  const entries = Object.entries(shape).filter(([k]) => {
    const h = fields?.[k];
    return !h?.hidden && (!h?.when || h.when(value));
  });
  const grouped = GROUP_ORDER.map((g) => ({ g, list: entries.filter(([k]) => (fields?.[k]?.group ?? "content") === g) })).filter((x) => x.list.length);
  const other = entries.filter(([k]) => !GROUP_ORDER.includes(fields?.[k]?.group ?? "content"));
  if (other.length) grouped.push({ g: "advanced", list: other });
  const titles: Record<string, string> = { content: t("content"), style: t("style"), advanced: t("advanced") };

  return (
    <div data-slot="schema-form" data-layout={layout} className={cn("vui-sf", className)}>
      {grouped.map(({ g, list }) => (
        <section key={g} className="vui-sf-section" aria-label={titles[g]}>
          {grouped.length > 1 ? <h3 className="vui-eyebrow">{titles[g]}</h3> : null}
          <div className={cn("flex flex-col gap-3.5", layout === "dialog" && "sm:grid sm:grid-cols-2 sm:gap-x-5")}>
            {list.map(([k, s]) => (
              <FieldNode key={k} ctx={ctx} name={k} schema={s} value={value[k]} path={[k]} hint={fields?.[k]} onChange={(v) => onChange(compact({ ...value, [k]: v }))} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
