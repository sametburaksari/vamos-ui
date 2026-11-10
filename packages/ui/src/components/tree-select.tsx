"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { ChevronsUpDown, Plus, Search, X } from "lucide-react";
import { cn } from "../lib/cn";
import { FieldContextReset, useFieldControl } from "../lib/field-context";
import { ChipRemoveButton } from "../lib/islands";
import { useLabels } from "../lib/labels";
import { Layer } from "../lib/layer";
import { useLocale } from "../lib/locale";
import { usePortalContainer } from "../lib/theme-scope";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { useTree, type TreeCheckValueMode, type TreeItemState, type TreeNode } from "../lib/use-tree";
import { controlVariants } from "../lib/variants";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { TreeViewRow } from "./tree-view";

const treeSelectLabels = {
  placeholder: "Select…",
  placeholderMultiple: "Add…",
  search: "Search…",
  empty: "Nothing to choose from",
  noMatches: "No matches for “{query}”",
  results: "{count, plural, =0 {No matches} one {# match} other {# matches}}",
  addChild: "Add",
  addUnder: "New item in {parent}",
  addRoot: "New top-level item",
  newName: "Name",
  create: "Create",
  cancel: "Cancel",
  clear: "Clear selection",
  selectedCount: "{count, plural, one {# selected} other {# selected}}",
};
export type TreeSelectLabels = typeof treeSelectLabels;

interface TreeSelectBaseProps {
  /** The hierarchy (categories, departments, folders, accounts). */
  nodes: TreeNode[];
  /** Loads children of nodes with `hasChildren` on first expand. */
  loadChildren?: (node: TreeNode, signal: AbortSignal) => Promise<TreeNode[]>;
  /** Can parents be chosen, or only leaves? Default `"any"`. */
  selectable?: "leaf" | "any";
  /** Trigger shows the full path ("Electronics › Phones"). Default `true`. */
  showPath?: boolean;
  /** Initially expanded ids, or `"selected"` to open the branches of the value. Default `"selected"`. */
  defaultExpanded?: string[] | "selected";
  /** "Add category": create under the focused node (or at the top level). Add the returned node to `nodes` too. */
  onCreate?: (parentId: string | null, label: string) => TreeNode | Promise<TreeNode>;
  /** Show the search box. Default `true`. */
  searchable?: boolean;
  /** `"inline"` renders the tree without a popover (category box in an editor side panel). */
  mode?: "popover" | "inline";
  /** Max height of the tree list in px. Default 288. */
  height?: number;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  searchPlaceholder?: string;
  /** Hidden input name(s) (multi → repeated). */
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: Partial<TreeSelectLabels>;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

export interface TreeSelectSingleProps extends TreeSelectBaseProps {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null, node: TreeNode | null) => void;
  cascade?: never;
  valueMode?: never;
}
export interface TreeSelectMultipleProps extends TreeSelectBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (ids: string[]) => void;
  /** Checking a parent checks its descendants (tri-state). Default `true`. */
  cascade?: boolean;
  /** What a fully-checked branch yields. Default `"all"`. */
  valueMode?: TreeCheckValueMode;
}
export type TreeSelectProps = TreeSelectSingleProps | TreeSelectMultipleProps;

const EMPTY: string[] = [];

function ancestorsOf(nodes: TreeNode[], ids: string[]): string[] {
  const want = new Set(ids);
  const out = new Set<string>();
  const walk = (list: TreeNode[], path: string[]) => {
    for (const n of list) {
      if (want.has(n.id)) path.forEach((p) => out.add(p));
      if (n.children) walk(n.children, [...path, n.id]);
    }
  };
  walk(nodes, []);
  return [...out];
}

function PathSeparator() {
  return (
    <span aria-hidden className="inline-block px-1 text-fg-subtle rtl:-scale-x-100">
      ›
    </span>
  );
}

/**
 * Pick from hierarchical data — product categories, departments, locations and warehouses,
 * folder destinations, chart of accounts. A searchable tree in a popover (or inline), single or
 * multi with tri-state cascade, lazy branches, search that keeps ancestors, and "Add category".
 *
 * ```tsx
 * <Field label="Category"><TreeSelect nodes={categories} selectable="leaf" value={categoryId} onValueChange={setCategoryId} /></Field>
 * <TreeSelect multiple nodes={regions} valueMode="parent" value={territories} onValueChange={setTerritories} />
 * ```
 */
export const TreeSelect = React.forwardRef<HTMLDivElement, TreeSelectProps>(function TreeSelect(props, ref) {
  const {
    nodes,
    loadChildren,
    selectable = "any",
    showPath = true,
    defaultExpanded = "selected",
    onCreate,
    searchable = true,
    mode = "popover",
    height = 288,
    size = "md",
    placeholder,
    searchPlaceholder,
    labels,
    className,
  } = props;
  const multiple = props.multiple === true;
  const t = useLabels("treeSelect", treeSelectLabels, labels);
  const { locale, dir } = useLocale();
  const container = usePortalContainer();
  const control = useFieldControl({
    id: props.id,
    name: props.name,
    disabled: props.disabled,
    readOnly: props.readOnly,
    required: props.required,
    "aria-describedby": props["aria-describedby"],
    "aria-labelledby": props["aria-labelledby"],
    "aria-invalid": props["aria-invalid"] ?? (props.invalid ? true : undefined),
  });
  const disabled = Boolean(control.disabled);
  const readOnly = Boolean(control.readOnly);

  const toArray = (v: string | string[] | null | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : v === null ? [] : [v]);
  const [ids, setIdsRaw] = useControllableState<string[]>({
    value: toArray(props.value as string | string[] | null | undefined),
    defaultValue: () => toArray(props.defaultValue as string | string[] | null | undefined) ?? EMPTY,
    name: "TreeSelect",
  });
  const onChangeRef = useLatest(props.onValueChange);
  const [open, setOpen] = useControllableState({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange, name: "TreeSelect" });
  const [query, setQuery] = React.useState("");
  const [initialExpanded] = React.useState(() => (defaultExpanded === "selected" ? ancestorsOf(nodes, ids) : defaultExpanded));
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const searchRef = React.useRef<HTMLInputElement | null>(null);

  const tree = useTree({
    nodes,
    loadChildren,
    defaultExpanded: initialExpanded,
    filter: query,
    locale,
    dir,
    selectionMode: multiple ? "none" : "single",
    selected: multiple ? undefined : ids,
    onSelectedChange: multiple
      ? undefined
      : (next) => {
          const id = next[next.length - 1] ?? null;
          setIdsRaw(id ? [id] : []);
          (onChangeRef.current as TreeSelectSingleProps["onValueChange"])?.(id, id ? (tree.getNode(id) ?? null) : null);
          if (mode === "popover") {
            setOpen(false);
            setQuery("");
          }
        },
    isSelectable: selectable === "leaf" ? (_n, hasChildren) => !hasChildren : undefined,
    checkable: multiple,
    checked: multiple ? ids : undefined,
    onCheckedChange: multiple
      ? (next) => {
          setIdsRaw(next);
          (onChangeRef.current as TreeSelectMultipleProps["onValueChange"])?.(next);
        }
      : undefined,
    cascade: multiple ? ((props as TreeSelectMultipleProps).cascade ?? true) : undefined,
    checkValueMode: multiple ? ((props as TreeSelectMultipleProps).valueMode ?? "all") : undefined,
  });

  const setIds = (next: string[]) => {
    setIdsRaw(next);
    if (multiple) (onChangeRef.current as TreeSelectMultipleProps["onValueChange"])?.(next);
    else (onChangeRef.current as TreeSelectSingleProps["onValueChange"])?.(next[0] ?? null, next[0] ? (tree.getNode(next[0]) ?? null) : null);
  };

  /* ---------- create ---------- */
  const [creating, setCreating] = React.useState<{ parentId: string | null } | null>(null);
  const [newName, setNewName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const submitCreate = async () => {
    if (!onCreate || !creating || !newName.trim()) return;
    setSaving(true);
    try {
      const node = await onCreate(creating.parentId, newName.trim());
      if (creating.parentId) tree.toggleExpanded(creating.parentId, true);
      setCreating(null);
      setNewName("");
      if (multiple) setIds([...ids, node.id]);
      else setIds([node.id]);
      requestAnimationFrame(() => tree.focusItem(node.id));
    } finally {
      setSaving(false);
    }
  };

  /* ---------- tree panel ---------- */
  const onRowClick = (item: TreeItemState) => {
    if (multiple) tree.toggleChecked(item.id);
    else if (selectable === "leaf" && item.hasChildren) tree.toggleExpanded(item.id);
    else tree.select(item.id);
  };

  const treeProps = tree.getTreeProps();
  const treeLabel = props["aria-label"] ?? searchPlaceholder ?? t("search");
  const focusedParent = tree.focusedId ? tree.getNode(tree.focusedId) : undefined;

  const panel = (
    <div data-slot="tree-select-panel" className="flex min-h-0 flex-col">
      {searchable ? (
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search aria-hidden className="size-4 shrink-0 text-fg-subtle" />
          <input
            ref={searchRef}
            type="search"
            aria-label={searchPlaceholder ?? t("search")}
            placeholder={searchPlaceholder ?? t("search")}
            autoComplete="off"
            spellCheck={false}
            value={query}
            disabled={disabled || readOnly}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && tree.items[0]) {
                e.preventDefault();
                tree.focusItem(tree.items[0].id);
              } else if (e.key === "Enter" && tree.filtering) {
                e.preventDefault();
                const first = tree.items.find((i) => i.match && !i.disabled);
                if (first) onRowClick(first);
              }
            }}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      ) : null}
      {tree.filtering ? (
        <span role="status" aria-live="polite" className="sr-only">
          {t("results", { count: tree.matchCount })}
        </span>
      ) : null}
      {nodes.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-fg-muted">{t("empty")}</p>
      ) : tree.items.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-fg-muted">{t("noMatches", { query })}</p>
      ) : (
        <div
          {...treeProps}
          aria-label={treeLabel}
          aria-labelledby={mode === "inline" ? control["aria-labelledby"] : undefined}
          aria-describedby={mode === "inline" ? control["aria-describedby"] : undefined}
          aria-invalid={mode === "inline" ? control["aria-invalid"] : undefined}
          aria-readonly={readOnly || undefined}
          className={cn("grid gap-px overflow-y-auto overscroll-contain p-1 outline-none", readOnly && "pointer-events-none")}
          style={{ maxHeight: height }}
          onKeyDown={(e) => {
            if (readOnly && (e.key === " " || e.key === "Enter")) return;
            treeProps.onKeyDown(e);
          }}
        >
          {tree.items.map((item) => (
            <TreeViewRow
              key={item.id}
              item={item}
              tree={tree}
              size={size === "lg" ? "md" : "sm"}
              checkbox={multiple}
              query={query}
              indent={14}
              onRowClick={onRowClick}
            />
          ))}
        </div>
      )}
      {onCreate && !readOnly ? (
        <div className="border-t border-line p-1.5">
          {creating ? (
            <form
              className="grid gap-1.5 p-1"
              onSubmit={(e) => {
                e.preventDefault();
                void submitCreate();
              }}
            >
              <label className="text-xs text-fg-muted" htmlFor={`${control.id ?? "tree-select"}-new`}>
                {creating.parentId ? t("addUnder", { parent: tree.getNode(creating.parentId)?.label ?? "" }) : t("addRoot")}
              </label>
              <div className="flex gap-1.5">
                <input
                  id={`${control.id ?? "tree-select"}-new`}
                  autoFocus
                  value={newName}
                  placeholder={t("newName")}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      setCreating(null);
                    }
                  }}
                  className={cn(controlVariants({ size: "sm" }), "flex-1")}
                />
                <Button type="submit" size="sm" variant="primary" loading={saving} disabled={!newName.trim()}>
                  {t("create")}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              size="xs"
              variant="ghost"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCreating({ parentId: focusedParent && !focusedParent.disabled ? focusedParent.id : null })}
            >
              <Plus aria-hidden />
              {focusedParent ? t("addUnder", { parent: focusedParent.label }) : t("addRoot")}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );

  const hidden = control.name
    ? ids.map((id) => <input key={id} type="hidden" name={control.name} value={id} />).concat(ids.length === 0 && !multiple ? [<input key="__empty" type="hidden" name={control.name} value="" />] : [])
    : null;

  if (mode === "inline") {
    return (
      <div
        ref={ref}
        data-slot="tree-select"
        data-mode="inline"
        aria-invalid={control["aria-invalid"]}
        className={cn("surface-2 overflow-hidden rounded-ui border border-line aria-invalid:border-danger", disabled && "pointer-events-none opacity-50", className)}
      >
        {panel}
        {multiple && ids.length ? (
          <div className="border-t border-line px-3 py-1.5 text-xs text-fg-subtle">{t("selectedCount", { count: ids.length })}</div>
        ) : null}
        {hidden}
      </div>
    );
  }

  const labelFor = (id: string) => {
    const path = tree.getPath(id);
    if (!path.length) return { text: id, parts: [id] };
    const parts = showPath ? path.map((n) => n.label) : [path[path.length - 1]!.label];
    return { text: parts.join(" › "), parts };
  };

  const triggerA11y = {
    id: control.id,
    "aria-label": props["aria-label"],
    "aria-labelledby": control["aria-labelledby"],
    "aria-describedby": control["aria-describedby"],
    "aria-invalid": control["aria-invalid"],
    // No aria-required: not allowed on a button (axe aria-allowed-attr). The Field marks the label.
    "aria-haspopup": "tree" as const,
    disabled: disabled || readOnly,
  };

  const content = (
    <PopoverPrimitive.Portal container={container}>
      <Layer asChild>
        <PopoverPrimitive.Content
          data-slot="tree-select-content"
          aria-label={treeLabel}
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="surface-popover ui-pop z-(--z-popover) w-(--radix-popover-trigger-width) min-w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-ui-lg outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            if (searchRef.current) searchRef.current.focus();
            else {
              const first = tree.items.find((i) => i.selected || i.checked === true) ?? tree.items[0];
              if (first) tree.focusItem(first.id);
            }
          }}
          onCloseAutoFocus={() => {
            setQuery("");
            setCreating(null);
          }}
        >
          <FieldContextReset>{panel}</FieldContextReset>
        </PopoverPrimitive.Content>
      </Layer>
    </PopoverPrimitive.Portal>
  );

  if (multiple) {
    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Anchor asChild>
          <div
            ref={ref}
            data-slot="tree-select"
            data-state={open ? "open" : "closed"}
            data-readonly={readOnly || undefined}
            aria-invalid={control["aria-invalid"]}
            aria-disabled={disabled || undefined}
            className={cn(controlVariants({ size, multiline: true }), "min-h-(--control-h) flex-wrap items-center gap-1.5 py-1.5 ps-1.5", className)}
          >
            {ids.map((id) => {
              const l = labelFor(id);
              const leaf = l.parts[l.parts.length - 1]!;
              return (
                <span key={id} title={l.text} className="inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-full bg-selected ps-2 pe-1.5 text-xs font-medium text-fg">
                  <span className="truncate">{leaf}</span>
                  {!readOnly && !disabled ? <ChipRemoveButton itemLabel={leaf} onRemove={() => tree.toggleChecked(id, false)} /> : null}
                </span>
              );
            })}
            {!readOnly ? (
              <PopoverPrimitive.Trigger asChild>
                <button
                  ref={triggerRef}
                  type="button"
                  {...triggerA11y}
                  className="inline-flex h-6 min-w-0 flex-1 items-center gap-1 rounded-ui-sm px-1.5 text-start text-fg-subtle outline-none hover:text-fg focus-visible:text-fg disabled:cursor-not-allowed [&_svg]:size-3.5"
                >
                  <Plus aria-hidden />
                  <span className="truncate">{placeholder ?? t("placeholderMultiple")}</span>
                </button>
              </PopoverPrimitive.Trigger>
            ) : null}
            {hidden}
          </div>
        </PopoverPrimitive.Anchor>
        {content}
      </PopoverPrimitive.Root>
    );
  }

  const current = ids[0] ? labelFor(ids[0]) : null;
  const showClear = current && !control.required && !disabled && !readOnly;
  const loadingAny = tree.items.some((i) => i.loading);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div
          ref={ref}
          data-slot="tree-select"
          data-state={open ? "open" : "closed"}
          data-readonly={readOnly || undefined}
          aria-invalid={control["aria-invalid"]}
          aria-disabled={disabled || undefined}
          className={cn(controlVariants({ size }), "p-0", className)}
        >
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={triggerRef}
              type="button"
              {...triggerA11y}
              className={cn("flex h-full min-w-0 flex-1 items-center gap-2 rounded-[inherit] ps-3 text-start outline-none disabled:cursor-not-allowed", showClear ? "pe-1" : "pe-3")}
            >
              {current ? (
                <span className="flex min-w-0 flex-1 items-center truncate">
                  {current.parts.map((p, i) => (
                    <React.Fragment key={i}>
                      {i > 0 ? <PathSeparator /> : null}
                      <span className={cn("truncate", i < current.parts.length - 1 ? "shrink text-fg-muted" : "shrink-0 text-fg")}>{p}</span>
                    </React.Fragment>
                  ))}
                </span>
              ) : (
                <span className="min-w-0 flex-1 truncate text-fg-subtle">{placeholder ?? t("placeholder")}</span>
              )}
              {loadingAny && !open ? <Spinner size="xs" tone="muted" /> : null}
              {!showClear && !readOnly ? <ChevronsUpDown aria-hidden className="ms-auto size-4 shrink-0 text-fg-subtle" /> : null}
            </button>
          </PopoverPrimitive.Trigger>
          {showClear ? (
            <button
              type="button"
              aria-label={t("clear")}
              onClick={() => {
                setIds([]);
                triggerRef.current?.focus();
              }}
              className="me-1.5 inline-flex size-6 shrink-0 items-center justify-center rounded-ui-sm text-fg-subtle hover:bg-hover hover:text-fg focus-ring [&_svg]:size-3.5"
            >
              <X aria-hidden />
            </button>
          ) : null}
          {hidden}
        </div>
      </PopoverPrimitive.Anchor>
      {content}
    </PopoverPrimitive.Root>
  );
});
