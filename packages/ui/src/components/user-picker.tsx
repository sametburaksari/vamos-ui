"use client";

import * as React from "react";
import { Plus, UserRound, UsersRound } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { compareText, highlightParts, matchText } from "../lib/text";
import { itemSlots } from "../lib/variants";
import { Avatar, AvatarGroup, type AvatarStatus } from "./avatar";
import { RecordPicker, type RecordPickerAction, type RecordPickerMultipleProps, type RecordPickerSingleProps, type RecordSource } from "./record-picker";

/** A person you can assign, mention or share with. */
export interface PickerUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  status?: AvatarStatus;
  /** Deactivated / left the company: dimmed, not selectable, still shown when already assigned. */
  disabled?: boolean;
  /** Role or department ("Account executive · Sales"). */
  meta?: string;
}

/** A team or group; picking it adds its members (or the team itself). */
export interface PickerTeam {
  id: string;
  name: string;
  memberCount: number;
}

const userPickerLabels = {
  unassigned: "Unassigned",
  assignToMe: "Assign to me",
  you: "you",
  teams: "Teams",
  people: "People",
  members: "{count, plural, one {# member} other {# members}}",
  assignees: "{label}: {names}",
  assigneesLabel: "Assignees",
  andMore: "{names} and {count} more",
  deactivated: "Deactivated",
  add: "Assign",
  search: "Search people…",
};
export type UserPickerLabels = typeof userPickerLabels;

/** Internal row type: a user, or a team shown in the same list. */
type Row = PickerUser & { kind?: "team"; memberCount?: number };

const TEAM_PREFIX = "team:";

interface UserPickerBaseProps {
  /** People: an array (searched in memory, locale-folded) or a server `RecordSource`. */
  source: RecordSource<PickerUser> | PickerUser[];
  /** Teams shown in their own group. */
  teams?: RecordSource<PickerTeam> | PickerTeam[];
  /** Resolve a picked team to people. Without it the team's id (`"team:<id>"`) is selected. */
  getTeamMembers?: (team: PickerTeam, signal: AbortSignal) => Promise<PickerUser[]>;
  /** Adds "Assign to me" and the "(you)" suffix. */
  currentUserId?: string;
  /** Field box (default), an avatar stack button (table cells, headers) or an always-open list. */
  trigger?: "field" | "avatars" | "inline";
  /** Avatars shown in the avatar trigger before "+N". Default 3. */
  maxAvatars?: number;
  /** Name of the role being assigned, for the trigger's accessible name ("Reviewers: …"). Default "Assignees". */
  roleLabel?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  /** Records for the initial value when `source` is a server source. */
  selectedRecords?: PickerUser[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: Partial<UserPickerLabels>;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export interface UserPickerSingleProps extends UserPickerBaseProps, Pick<RecordPickerSingleProps<PickerUser>, "value" | "defaultValue" | "onValueChange"> {
  multiple?: false;
}
export interface UserPickerMultipleProps extends UserPickerBaseProps, Pick<RecordPickerMultipleProps<PickerUser>, "value" | "defaultValue" | "onValueChange" | "max"> {
  multiple: true;
}
export type UserPickerProps = UserPickerSingleProps | UserPickerMultipleProps;

// RecordPicker caches results per `source.key` for the session, so every array needs its own key:
// with a shared "users" key, two pickers on one page showed each other's people.
const arrayKeys = new WeakMap<object, string>();
let arrayKeySeq = 0;
function keyForArray(prefix: string, input: object): string {
  let key = arrayKeys.get(input);
  if (!key) arrayKeys.set(input, (key = `${prefix}#${++arrayKeySeq}`));
  return key;
}

function toSource<T>(key: string, input: RecordSource<T> | T[], getId: (t: T) => string, getText: (t: T) => string, sortBy: (t: T) => string): RecordSource<T> {
  if (!Array.isArray(input)) return input;
  return {
    key: keyForArray(key, input),
    getId,
    getLabel: sortBy,
    async search(q, { locale }) {
      const cmp = compareText(locale);
      const items = (q.trim() ? input.filter((x) => matchText(getText(x), q, locale)) : input).slice().sort((a, b) => cmp(sortBy(a), sortBy(b)));
      return { items };
    },
    async getByIds(ids) {
      const set = new Set(ids);
      return input.filter((x) => set.has(getId(x)));
    },
  };
}

function Bold({ text, query, locale }: { text: string; query: string; locale: string }) {
  if (!query.trim()) return <>{text}</>;
  return (
    <>
      {highlightParts(text, query, locale).map((p, i) =>
        p.match ? (
          <mark key={i} className="bg-transparent font-semibold text-fg">
            {p.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ),
      )}
    </>
  );
}

/**
 * Assign or mention people and teams: task assignee, approvers, deal owner, reviewers, shift staff,
 * share-with. A Record picker specialised for people — avatars with presence, role line,
 * "Assign to me", deactivated users, teams, and an avatar-stack trigger for table cells.
 *
 * ```tsx
 * <Field label="Owner"><UserPicker source={people} currentUserId={me.id} value={ownerId} onValueChange={setOwnerId} /></Field>
 * <UserPicker multiple trigger="avatars" source={people} value={assignees} onValueChange={setAssignees} aria-label="Assignees" />
 * ```
 */
export const UserPicker = React.forwardRef<HTMLDivElement, UserPickerProps>(function UserPicker(props, ref) {
  const { source, teams, getTeamMembers, currentUserId, trigger = "field", maxAvatars = 3, roleLabel, labels, selectedRecords, ...rest } = props;
  const t = useLabels("userPicker", userPickerLabels, labels);
  const { locale } = useLocale();

  const people = React.useMemo(
    () =>
      toSource<PickerUser>(
        "users",
        source,
        (u) => u.id,
        (u) => [u.name, u.email ?? "", u.meta ?? ""].join(" "),
        (u) => u.name,
      ),
    [source],
  );
  const teamSource = React.useMemo(
    () => (teams ? toSource<PickerTeam>("teams", teams, (x) => x.id, (x) => x.name, (x) => x.name) : undefined),
    [teams],
  );

  // One combined source: people, then teams (prefixed ids) in their own group.
  const combined = React.useMemo<RecordSource<Row>>(
    () => ({
      key: `${people.key}${teamSource ? `+${teamSource.key}` : ""}`,
      getId: (r) => (r.kind === "team" ? `${TEAM_PREFIX}${r.id}` : r.id),
      getLabel: (r) => r.name,
      getDescription: (r) => (r.kind === "team" ? undefined : (r.meta ?? r.email)),
      getAvatar: (r) => ({ name: r.name, src: r.avatarUrl, shape: r.kind === "team" ? "square" : "circle" }),
      async search(q, ctx) {
        const [p, tm] = await Promise.all([people.search(q, ctx), teamSource && !ctx.cursor ? teamSource.search(q, { ...ctx, cursor: undefined }) : Promise.resolve({ items: [] as PickerTeam[] })]);
        const teamRows: Row[] = tm.items.map((x) => ({ id: x.id, name: x.name, kind: "team", memberCount: x.memberCount }));
        return { items: [...(p.items as Row[]), ...teamRows], nextCursor: p.nextCursor };
      },
      getByIds: people.getByIds
        ? async (ids, signal) => {
            const userIds = ids.filter((id) => !id.startsWith(TEAM_PREFIX));
            const teamIds = ids.filter((id) => id.startsWith(TEAM_PREFIX)).map((id) => id.slice(TEAM_PREFIX.length));
            const [u, tm] = await Promise.all([
              userIds.length ? people.getByIds!(userIds, signal) : Promise.resolve([] as PickerUser[]),
              teamIds.length && teamSource?.getByIds ? teamSource.getByIds(teamIds, signal) : Promise.resolve([] as PickerTeam[]),
            ]);
            return [...(u as Row[]), ...tm.map((x): Row => ({ id: x.id, name: x.name, kind: "team", memberCount: x.memberCount }))];
          }
        : undefined,
    }),
    [people, teamSource],
  );

  const me = React.useCallback(
    (u: PickerUser) => (currentUserId && u.id === currentUserId ? `${u.name} (${t("you")})` : u.name),
    [currentUserId, t],
  );

  const actions = React.useMemo<RecordPickerAction<Row>[]>(() => {
    if (!currentUserId) return [];
    return [
      {
        id: "me",
        label: t("assignToMe"),
        icon: <UserRound aria-hidden />,
        onSelect: async ({ select }) => {
          const ctrl = new AbortController();
          const found = (await combined.getByIds?.([currentUserId], ctrl.signal))?.[0];
          if (found) select(found);
        },
      },
    ];
  }, [combined, currentUserId, t]);

  const renderItem = (r: Row, s: { selected: boolean; disabled: boolean; query: string }) => {
    if (r.kind === "team") {
      return (
        <>
          <span aria-hidden className="inline-flex size-6 shrink-0 items-center justify-center rounded-[28%] bg-selected text-fg-muted [&_svg]:size-3.5">
            <UsersRound />
          </span>
          <span className="min-w-0 flex-1 truncate">
            <Bold text={r.name} query={s.query} locale={locale} />
          </span>
          <span className={itemSlots.shortcut}>{t("members", { count: r.memberCount ?? 0 })}</span>
        </>
      );
    }
    const isMe = currentUserId === r.id;
    return (
      <>
        <Avatar name={r.name} src={r.avatarUrl} status={r.status} size="sm" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate">
            <Bold text={r.name} query={s.query} locale={locale} />
            {isMe ? <>{" "}<span className="text-fg-subtle">({t("you")})</span></> : null}
          </span>
          {r.disabled ? (
            <span className={itemSlots.description}>{t("deactivated")}</span>
          ) : r.meta || r.email ? (
            <span className={cn(itemSlots.description, "truncate")}>
              <Bold text={r.meta ?? r.email ?? ""} query={s.query} locale={locale} />
            </span>
          ) : null}
        </span>
      </>
    );
  };

  const resolveSelection = React.useCallback(
    async (r: Row): Promise<Row | Row[]> => {
      if (r.kind !== "team" || !getTeamMembers) return r;
      const members = await getTeamMembers({ id: r.id, name: r.name, memberCount: r.memberCount ?? 0 }, new AbortController().signal);
      return members.filter((m) => !m.disabled);
    },
    [getTeamMembers],
  );

  const shared = {
    ...rest,
    source: combined,
    renderItem,
    actions,
    selectedRecords: selectedRecords as Row[] | undefined,
    getDisabled: (r: Row) => Boolean(r.disabled),
    getGroup: (r: Row) => (teamSource ? (r.kind === "team" ? t("teams") : t("people")) : undefined),
    resolveSelection,
    recent: false as const,
    searchPlaceholder: t("search"),
    placeholder: rest.placeholder ?? (props.multiple ? t("add") : t("unassigned")),
    mode: trigger === "inline" ? ("inline" as const) : ("popover" as const),
  };

  const renderTrigger =
    trigger === "avatars"
      ? ({ selected, disabled }: { selected: Row[]; disabled: boolean }) => {
          const names = selected.map((u) => me(u));
          const shown = names.slice(0, 2).join(", ");
          const list = names.length > 2 ? t("andMore", { names: shown, count: names.length - 2 }) : shown || t("unassigned");
          return (
            <AvatarsTrigger
              aria-label={rest["aria-label"] ? `${rest["aria-label"]}: ${list}` : t("assignees", { label: roleLabel ?? t("assigneesLabel"), names: list })}
              disabled={disabled}
              selected={selected}
              max={maxAvatars}
              size={props.size}
            />
          );
        }
      : undefined;

  if (props.multiple) {
    return <RecordPicker<Row> ref={ref} {...(shared as Omit<RecordPickerMultipleProps<Row>, "source">)} source={combined} multiple renderTrigger={renderTrigger} />;
  }
  return <RecordPicker<Row> ref={ref} {...(shared as Omit<RecordPickerSingleProps<Row>, "source">)} source={combined} multiple={false} renderTrigger={renderTrigger} />;
});

/** Avatar stack + "+" — the compact trigger for table cells and record headers. */
const AvatarsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { selected: Row[]; max: number; size?: "sm" | "md" | "lg" }
>(function AvatarsTrigger({ selected, max, size = "md", className, "aria-label": label, ...props }, ref) {
  const avatarSize = size === "sm" ? "xs" : size === "lg" ? "md" : "sm";
  return (
    <button
      ref={ref}
      type="button"
      data-slot="user-picker-avatars"
      className={cn(
        "group/avatars inline-flex items-center gap-1 rounded-full p-0.5 pe-1 outline-none transition-colors hover:bg-hover focus-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {/* The name is text content, not aria-label: the avatar initials are visible, and an
          aria-label that doesn't contain them fails WCAG 2.5.3 (label in name). */}
      {label ? <span className="sr-only">{label}</span> : null}
      {selected.length ? (
        <AvatarGroup max={max} size={avatarSize} aria-hidden>
          {selected.map((u) => (
            <Avatar key={u.id} name={u.name} src={u.avatarUrl} />
          ))}
        </AvatarGroup>
      ) : null}
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-dashed border-field-border-hover text-fg-subtle transition-colors group-hover/avatars:border-fg-subtle group-hover/avatars:text-fg",
          avatarSize === "xs" ? "size-5 [&_svg]:size-3" : avatarSize === "sm" ? "size-6 [&_svg]:size-3.5" : "size-8 [&_svg]:size-4",
        )}
      >
        <Plus />
      </span>
    </button>
  );
});
