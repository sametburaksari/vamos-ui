"use client";

import * as React from "react";
import { Check, ChevronDown, Copy, Link2, MoreHorizontal, Pencil, Plus, Star, Trash2, Users } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { getCollator } from "../lib/text";
import { useContainerWidth } from "../lib/use-container-width";
import { ConfirmDialog } from "../components/alert-dialog";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "../components/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/dropdown-menu";
import { Field, Input } from "../components/input";
import { RadioGroup } from "../components/radio-group";
import { Tooltip } from "../components/tooltip";
import { toast } from "../components/toast";
import { viewStateEqual } from "./view-state";
import type { SavedView, ViewState } from "./types";

export const savedViewsLabels = {
  label: "Views",
  all: "All",
  more: "More",
  moreAria: "More views",
  create: "View",
  createAria: "Save current view",
  modified: "Modified",
  modifiedAnnounce: "View modified.",
  save: "Save",
  saveAs: "Save as new",
  reset: "Reset",
  readOnlyReason: "Only the owner can change this team view. Save a copy instead.",
  actions: "View actions for {name}",
  rename: "Rename",
  duplicate: "Duplicate",
  setDefault: "Set as default",
  isDefault: "Default view",
  copyLink: "Copy link",
  linkCopied: "Link copied",
  delete: "Delete view",
  deleteTitle: "Delete “{name}”?",
  deleteDescription: "The view is removed for everyone who can see it. The records stay as they are.",
  deleteConfirm: "Delete view",
  dialogCreate: "Save view",
  dialogCreateDescription: "Saves the current filters, sort and columns.",
  dialogRename: "Rename view",
  name: "Name",
  namePlaceholder: "e.g. Hot leads this month",
  nameRequired: "Give the view a name.",
  scope: "Visible to",
  personal: "Only me",
  team: "Everyone on the team",
  makeDefault: "Open this view by default",
  cancel: "Cancel",
  confirmSave: "Save view",
  confirmRename: "Rename",
  saving: "Saving…",
  saveError: "Couldn’t save the view. Try again.",
  copyOf: "{name} copy",
  teamView: "Team view",
  selectAria: "Current view: {name}",
};
export type SavedViewsLabels = typeof savedViewsLabels;

export interface SavedViewsSaveInput {
  name: string;
  scope: SavedView["scope"];
  isDefault?: boolean;
  /** Set for "Duplicate" (the copied view's state); otherwise save `current`. */
  state?: ViewState;
}

export interface SavedViewsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "onReset"> {
  views: SavedView[];
  /** Active view id; `null` = "All" (unsaved). */
  activeId: string | null;
  /** The live list state (`useDataTable().savedViewsBinding(views)` provides it). */
  current: ViewState;
  /** Default: `!viewStateEqual(current, active.state)`. */
  isDirty?: boolean;
  onSelect: (id: string | null) => void;
  /** Create a view from `current` (or `input.state` for Duplicate). Resolve with the stored view. */
  onSave?: (input: SavedViewsSaveInput) => Promise<SavedView | void> | SavedView | void;
  /** Overwrite the active view with `current`. */
  onUpdate?: (id: string, state: ViewState) => Promise<void> | void;
  onRename?: (id: string, name: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onSetDefault?: (id: string) => Promise<void> | void;
  /** Drop unsaved changes (back to the active view's state). */
  onReset: () => void;
  /** Link for "Copy link". Default: the current URL with `sv=<id>`. */
  getShareUrl?: (id: string) => string;
  permissions?: { canCreateTeam?: boolean; canEdit?: (view: SavedView) => boolean };
  /** `"auto"` (default) switches to `"select"` under 420px of container width. */
  variant?: "auto" | "tabs" | "select";
  /** Show the built-in "All" entry (`activeId === null`). Default `true`. */
  showAll?: boolean;
  /** Tabs shown before the rest go into "More". Default 4. */
  maxVisible?: number;
  /** Sort views by name (locale collation). Default `false` (keeps your order). */
  sortByName?: boolean;
  /** Id of the element the tabs control (the list), for `aria-controls`. */
  panelId?: string;
  size?: "sm" | "md";
  labels?: Partial<SavedViewsLabels>;
}

type DialogState = { kind: "create" } | { kind: "rename"; view: SavedView } | null;

function defaultShareUrl(id: string) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("sv", id);
  return url.toString();
}

/**
 * Named list configurations — "My open deals", "Hot leads", "Probation ending" — as tabs above a
 * list. Switching applies filters, sort and columns; changes show a "Modified" strip with Save,
 * Save as new and Reset. Persistence is the app's job; the kit provides shape, dirty state and links.
 *
 * ```tsx
 * <SavedViews views={views} {...table.savedViewsBinding(views)} onSave={create} onUpdate={update} />
 * ```
 */
export const SavedViews = React.forwardRef<HTMLDivElement, SavedViewsProps>(function SavedViews(
  {
    views,
    activeId,
    current,
    isDirty: dirtyProp,
    onSelect,
    onSave,
    onUpdate,
    onRename,
    onDelete,
    onSetDefault,
    onReset,
    getShareUrl = defaultShareUrl,
    permissions,
    variant = "auto",
    showAll = true,
    maxVisible = 4,
    sortByName,
    panelId,
    size = "md",
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("savedViews", savedViewsLabels, labels);
  const { locale } = useLocale();
  const { ref: measureRef, width } = useContainerWidth<HTMLDivElement>();
  const asSelect = variant === "select" || (variant === "auto" && width !== undefined && width < 420);
  const [dialog, setDialog] = React.useState<DialogState>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<SavedView | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const [focusKey, setFocusKey] = React.useState<string | null>(null);

  const ordered = React.useMemo(() => {
    const list = [...views];
    if (sortByName) {
      const c = getCollator(locale);
      list.sort((a, b) => Number(Boolean(b.system)) - Number(Boolean(a.system)) || c.compare(a.name, b.name));
    }
    return list;
  }, [views, sortByName, locale]);
  const active = activeId ? (views.find((v) => v.id === activeId) ?? null) : null;
  const dirty = dirtyProp ?? (active ? !viewStateEqual(current, active.state) : false);
  const canEdit = (v: SavedView) => !v.system && (permissions?.canEdit ? permissions.canEdit(v) : true);

  React.useEffect(() => {
    if (dirty) setAnnounce(t("modifiedAnnounce"));
    else setAnnounce("");
  }, [dirty, t]);

  const visible = ordered.slice(0, maxVisible);
  if (active && !visible.includes(active)) visible.push(active);
  const overflow = ordered.filter((v) => !visible.includes(v));
  const keyOf = (id: string | null) => id ?? "__all";
  const tabKeys = [...(showAll ? [null] : []), ...visible.map((v) => v.id)];
  const activeKey = keyOf(activeId);
  const rovingKey = focusKey && tabKeys.some((k) => keyOf(k) === focusKey) ? focusKey : activeKey;

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    let to = -1;
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) to = (index + 1) % tabKeys.length;
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) to = (index - 1 + tabKeys.length) % tabKeys.length;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = tabKeys.length - 1;
    if (to === -1) return;
    e.preventDefault();
    const key = keyOf(tabKeys[to]!);
    setFocusKey(key);
    tabRefs.current.get(key)?.focus();
  };

  const copyLink = async (id: string) => {
    const url = getShareUrl(id);
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("linkCopied"));
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  const update = async () => {
    if (!active || !onUpdate || !canEdit(active)) return;
    setSaving(true);
    try {
      await onUpdate(active.id, current);
    } catch {
      toast.danger(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async (v: SavedView) => {
    if (!onSave) return;
    try {
      const created = await onSave({ name: t("copyOf", { name: v.name }), scope: "personal", state: v.state });
      if (created) onSelect(created.id);
    } catch {
      toast.danger(t("saveError"));
    }
  };

  const tabClass = cn(
    "group/tab relative inline-flex shrink-0 items-center gap-1.5 rounded-ui-sm px-2.5 font-medium whitespace-nowrap transition-colors focus-ring",
    size === "sm" ? "h-7 text-xs" : "h-8 text-[13px]",
    "text-fg-muted hover:bg-hover hover:text-fg aria-selected:bg-selected aria-selected:text-fg",
  );

  const tab = (v: SavedView | null, index: number) => {
    const key = keyOf(v?.id ?? null);
    const selected = key === activeKey;
    const Icon = v?.icon;
    return (
      <button
        key={key}
        ref={(el) => {
          if (el) tabRefs.current.set(key, el);
          else tabRefs.current.delete(key);
        }}
        type="button"
        role="tab"
        id={`${key}-tab`}
        aria-selected={selected}
        aria-controls={panelId}
        tabIndex={key === rovingKey ? 0 : -1}
        onFocus={() => setFocusKey(key)}
        onKeyDown={(e) => onTabKeyDown(e, index)}
        onClick={() => !selected && onSelect(v?.id ?? null)}
        className={tabClass}
        data-slot="saved-view-tab"
      >
        {Icon ? <Icon className="size-3.5 shrink-0 text-fg-subtle group-aria-selected/tab:text-fg-muted" /> : null}
        <span className="max-w-[12rem] truncate">{v ? v.name : t("all")}</span>
        {v?.scope === "team" ? <Users aria-label={t("teamView")} className="size-3 shrink-0 text-fg-subtle" /> : null}
        {selected && dirty ? (
          <>
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent-ink" />
            <span className="sr-only">, {t("modified")}</span>
          </>
        ) : null}
      </button>
    );
  };

  const actionsMenu = active ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t("actions", { name: active.name })} className={cn("inline-flex shrink-0 items-center justify-center rounded-ui-sm text-fg-subtle transition-colors hover:bg-hover hover:text-fg focus-ring", size === "sm" ? "size-7" : "size-8")}>
          <MoreHorizontal aria-hidden className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" size="sm">
        {onRename ? (
          <DropdownMenuItem icon={<Pencil />} disabled={!canEdit(active)} onSelect={() => setDialog({ kind: "rename", view: active })}>
            {t("rename")}
          </DropdownMenuItem>
        ) : null}
        {onSave ? (
          <DropdownMenuItem icon={<Copy />} onSelect={() => duplicate(active)}>
            {t("duplicate")}
          </DropdownMenuItem>
        ) : null}
        {onSetDefault ? (
          <DropdownMenuItem icon={active.isDefault ? <Check /> : <Star />} disabled={active.isDefault} onSelect={() => onSetDefault(active.id)}>
            {active.isDefault ? t("isDefault") : t("setDefault")}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem icon={<Link2 />} onSelect={() => copyLink(active.id)}>
          {t("copyLink")}
        </DropdownMenuItem>
        {onDelete && canEdit(active) ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<Trash2 />} tone="danger" onSelect={() => setConfirmDelete(active)}>
              {t("delete")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  const createButton = onSave ? (
    <button
      type="button"
      onClick={() => setDialog({ kind: "create" })}
      aria-label={t("createAria")}
      className={cn("inline-flex shrink-0 items-center gap-1 rounded-ui-sm px-2 font-medium text-fg-subtle transition-colors hover:bg-hover hover:text-fg focus-ring", size === "sm" ? "h-7 text-xs" : "h-8 text-[13px]")}
    >
      <Plus aria-hidden className="size-3.5" strokeWidth={2.25} />
      {t("create")}
    </button>
  ) : null;

  const readOnlyActive = active ? !canEdit(active) : true;
  const saveButton = (
    <Button size="xs" variant="ghost" className="text-accent-ink" aria-disabled={readOnlyActive || !onUpdate || undefined} loading={saving} onClick={() => (readOnlyActive ? undefined : update())}>
      {t("save")}
    </Button>
  );

  const dirtyStrip =
    dirty && active ? (
      <div data-slot="saved-views-dirty" className="ui-fade flex shrink-0 items-center gap-0.5 ps-1 text-xs">
        <span className="me-1 hidden items-center gap-1.5 text-fg-muted sm:inline-flex">
          <span aria-hidden className="size-1.5 rounded-full bg-accent-ink" />
          {t("modified")}
        </span>
        {onUpdate ? readOnlyActive ? <Tooltip content={t("readOnlyReason")}>{saveButton}</Tooltip> : saveButton : null}
        {onSave ? (
          <Button size="xs" variant="ghost" onClick={() => setDialog({ kind: "create" })}>
            {t("saveAs")}
          </Button>
        ) : null}
        <Button size="xs" variant="ghost" className="text-fg-muted" onClick={onReset}>
          {t("reset")}
        </Button>
      </div>
    ) : null;

  const body = asSelect ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("selectAria", { name: active?.name ?? t("all") })}
          className={cn("inline-flex min-w-0 items-center gap-1.5 rounded-ui-sm px-2.5 font-medium text-fg transition-colors hover:bg-hover focus-ring", size === "sm" ? "h-7 text-xs" : "h-8 text-[13px]")}
        >
          <span className="truncate">{active?.name ?? t("all")}</span>
          {dirty ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent-ink" /> : null}
          <ChevronDown aria-hidden className="size-3.5 shrink-0 text-fg-subtle" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" size="md">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={activeKey} onValueChange={(k) => onSelect(k === "__all" ? null : k)}>
          {showAll ? <DropdownMenuRadioItem value="__all">{t("all")}</DropdownMenuRadioItem> : null}
          {ordered.map((v) => (
            <DropdownMenuRadioItem key={v.id} value={v.id}>
              {v.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {onSave ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<Plus />} onSelect={() => setDialog({ kind: "create" })}>
              {t("createAria")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <>
      <div role="tablist" aria-label={t("label")} className="flex min-w-0 items-center gap-0.5 overflow-x-auto scrollbar-none">
        {tabKeys.map((k, i) => tab(k === null ? null : views.find((v) => v.id === k)!, i))}
      </div>
      {overflow.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={t("moreAria")} className={cn("inline-flex shrink-0 items-center gap-1 rounded-ui-sm px-2 font-medium text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring", size === "sm" ? "h-7 text-xs" : "h-8 text-[13px]")}>
              {t("more")}
              <ChevronDown aria-hidden className="size-3.5 text-fg-subtle" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" size="md">
            {overflow.map((v) => (
              <DropdownMenuItem key={v.id} onSelect={() => onSelect(v.id)}>
                {v.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </>
  );

  return (
    <div
      ref={(node) => {
        measureRef(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="saved-views"
      data-variant={asSelect ? "select" : "tabs"}
      className={cn("flex min-w-0 items-center gap-1", className)}
      {...props}
    >
      {body}
      {actionsMenu}
      {createButton}
      {dirtyStrip}
      <span aria-live="polite" className="sr-only">
        {announce}
      </span>

      <SavedViewDialog
        state={dialog}
        t={t}
        canCreateTeam={permissions?.canCreateTeam}
        saving={saving}
        onClose={() => setDialog(null)}
        onSubmit={async ({ name, scope, isDefault }) => {
          setSaving(true);
          try {
            if (dialog?.kind === "rename") {
              await onRename?.(dialog.view.id, name);
            } else {
              const created = await onSave?.({ name, scope, isDefault });
              if (created) onSelect(created.id);
            }
            setDialog(null);
            return null;
          } catch {
            return t("saveError");
          } finally {
            setSaving(false);
          }
        }}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        tone="danger"
        title={t("deleteTitle", { name: confirmDelete?.name ?? "" })}
        description={t("deleteDescription")}
        confirmLabel={t("deleteConfirm")}
        onConfirm={async () => {
          if (confirmDelete) await onDelete?.(confirmDelete.id);
        }}
        onResult={(ok) => {
          if (ok && confirmDelete && confirmDelete.id === activeId) onSelect(views.find((v) => v.isDefault && v.id !== confirmDelete.id)?.id ?? null);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
});

function SavedViewDialog({
  state,
  t,
  canCreateTeam,
  saving,
  onClose,
  onSubmit,
}: {
  state: DialogState;
  t: ReturnType<typeof useLabels<SavedViewsLabels>>;
  canCreateTeam?: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (v: { name: string; scope: SavedView["scope"]; isDefault: boolean }) => Promise<string | null>;
}) {
  const [name, setName] = React.useState("");
  const [scope, setScope] = React.useState<SavedView["scope"]>("personal");
  const [isDefault, setIsDefault] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const open = state !== null;
  React.useEffect(() => {
    if (!state) return;
    setName(state.kind === "rename" ? state.view.name : "");
    setScope("personal");
    setIsDefault(false);
    setError(null);
  }, [state]);
  const rename = state?.kind === "rename";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    const err = await onSubmit({ name: name.trim(), scope, isDefault });
    if (err) setError(err);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="sm">
        <form onSubmit={submit} noValidate className="contents">
          <DialogHeader title={rename ? t("dialogRename") : t("dialogCreate")} description={rename ? undefined : t("dialogCreateDescription")} />
          <DialogBody className="grid gap-4">
            <Field label={t("name")} error={error ?? undefined} required>
              <Input data-autofocus value={name} placeholder={t("namePlaceholder")} maxLength={60} onChange={(e) => setName(e.target.value)} />
            </Field>
            {!rename && canCreateTeam ? (
              <Field label={t("scope")}>
                <RadioGroup
                  value={scope}
                  onValueChange={(v) => setScope(v as SavedView["scope"])}
                  items={[
                    { value: "personal", label: t("personal") },
                    { value: "team", label: t("team") },
                  ]}
                />
              </Field>
            ) : null}
            {!rename ? <Checkbox label={t("makeDefault")} checked={isDefault} onCheckedChange={(c) => setIsDefault(c === true)} /> : null}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="primary" loading={saving} loadingText={t("saving")}>
              {rename ? t("confirmRename") : t("confirmSave")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
