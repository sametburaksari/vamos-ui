import { ex, type DocEntry } from "../types";
import CommentThreadDemo from "../examples/comment-thread/demo";
import CommentThreadMentions from "../examples/comment-thread/mentions";
import CommentThreadAttachments from "../examples/comment-thread/attachments";
import CommentThreadOptimistic from "../examples/comment-thread/optimistic";
import CommentThreadResolve from "../examples/comment-thread/resolve";
import CommentThreadCompact from "../examples/comment-thread/compact";

const entry: DocEntry = {
  slug: "comment-thread",
  title: "Comment thread",
  group: "Data display",
  description:
    "Threaded discussion on a record — editorial notes on a post, CRM notes on a deal, feedback on a candidate, a partner ticket. One reply level, @people and #record mentions with a picker, attachments, reactions, edit and delete, resolve and collapse, and optimistic sending / failed states.",
  source: ["components/comment-thread.tsx", "components/attachment-list.tsx"],
  basedOn: "Plain textarea + combobox-pattern mention picker; ARIA feed",
  usage: `import { CommentThread } from "@vamos-ui/react";

<CommentThread
  comments={comments}
  currentUserId={me.id}
  currentUser={me}
  mentionSources={[{ search: (q) => api.people(q) }]}
  onSubmit={({ body, parentId, mentions }) => api.comment(dealId, { body, parentId })}
  onResolve={(id, resolved) => api.resolve(id, resolved)}
/>

// Stored bodies keep mentions as tokens:
// "@[Jane Cooper](user:42) can you check line 3?"`,
  demo: ex("demo", "Deal discussion (CRM)", "comment-thread/demo.tsx", CommentThreadDemo, "Reply, react, edit or delete your own comments, resolve a thread, copy a link."),
  examples: [
    ex("mentions", "@people and #records", "comment-thread/mentions.tsx", CommentThreadMentions, "One source per trigger. ↑/↓ move, Enter or Tab insert, Esc closes; the submitted body holds @[Name](kind:id) tokens."),
    ex("attachments", "Files in comments (HR)", "comment-thread/attachments.tsx", CommentThreadAttachments, "allowAttachments adds a paperclip; files arrive in onSubmit and render as chips."),
    ex("optimistic", "Sending and failed (PRM)", "comment-thread/optimistic.tsx", CommentThreadOptimistic, "Add the comment with status \"sending\" right away; on error set \"failed\" and handle Retry / Discard."),
    ex("resolve", "Resolve, collapse and deleted (CMS)", "comment-thread/resolve.tsx", CommentThreadResolve, "Resolved threads collapse their replies behind \"Show\"; a deleted comment with replies leaves a placeholder."),
    ex("compact", "Side panel with sticky composer", "comment-thread/compact.tsx", CommentThreadCompact, "layout=\"compact\" and composer=\"sticky-bottom\" inside a scrolling panel."),
  ],
  api: [
    { name: "CommentThread", props: [
      { name: "comments", type: "CommentData[]", description: "All comments; replies point to their top-level comment with parentId." },
      { name: "currentUserId / currentUser", type: "string / CommentAuthor", description: "Own comments get Edit and Delete; the avatar sits beside the composer." },
      { name: "onSubmit", type: "({ body, parentId?, attachments, mentions }) => void | Promise<void>", description: "Post a comment or reply. Without it (or with readOnly) there is no composer." },
      { name: "onEdit / onDelete", type: "(id, body) => … / (id) => …", description: "Inline edit (Esc cancels) and delete (confirm with an undo toast in your handler)." },
      { name: "onResolve", type: "(id, resolved) => void | Promise<void>", description: "Resolve / reopen top-level comments." },
      { name: "onRetry / onDiscard", type: "(comment) => void", description: "Actions on failed comments." },
      { name: "onReact / reactions", type: "(id, key, on) => void / ReactionOption[]", description: "Reaction toggles and the picker; default set is icon-based (like, agree, love, question, seen)." },
      { name: "mentionSources", type: "MentionSource[]", description: "{ search(q), trigger?: \"@\" | \"#\" } — async, locale-folded ranking." },
      { name: "renderMention", type: "(mention) => ReactNode", description: "Replace the default chip (e.g. link a #record)." },
      { name: "getLink", type: "(comment) => string", description: "Shows \"Copy link\"." },
      { name: "allowAttachments", type: "boolean", default: "false", description: "Paperclip in the composer." },
      { name: "onPreviewAttachment", type: "(file) => void", description: "Open an attached file." },
      { name: "order", type: '"oldest-first" | "newest-first"', default: '"oldest-first"', description: "Top-level order; replies are always oldest first." },
      { name: "layout", type: '"thread" | "compact"', default: '"thread"', description: "Full or side-panel density." },
      { name: "composer", type: '"inline" | "sticky-bottom" | "top"', default: '"inline"', description: "Where the new-comment box sits." },
      { name: "readOnly", type: "boolean", default: "false", description: "No composer or actions." },
      { name: "now", type: "Date | string | number", description: "Pin relative times (docs, tests)." },
      { name: "labels", type: "Partial<CommentThreadLabels>", description: "All built-in strings (empty, placeholder, reply, resolve, deleted, sending, failed, …)." },
    ] },
    { name: "CommentData", props: [
      { name: "id / author / body / createdAt", type: "string / CommentAuthor / string / string", description: "Body is the stored form with @[Name](kind:id) tokens." },
      { name: "parentId", type: "string", description: "Reply to this top-level comment." },
      { name: "editedAt", type: "string", description: "Shows \"edited\" with the time as a tooltip." },
      { name: "attachments", type: "AttachmentData[]", description: "Rendered as chips." },
      { name: "resolved / resolvedBy", type: "boolean / string", description: "Collapsed state and who resolved it." },
      { name: "status", type: '"sending" | "failed"', description: "Optimistic states." },
      { name: "deleted", type: "boolean", description: "Placeholder when it has replies, hidden otherwise." },
      { name: "reactions", type: "{ key; count; reacted?; users? }[]", description: "Reaction counts." },
    ] },
    { name: "Parts and helpers", props: [
      { name: "CommentComposer", type: "onSubmit, mentionSources, allowAttachments, defaultValue, onCancel, variant", description: "The box on its own (⌘/Ctrl+Enter sends)." },
      { name: "Comment", type: "comment, currentUserId, isReply, handlers", description: "One <article> labelled by author and time." },
      { name: "CommentBody / MentionChip", type: "body / mention", description: "Render a stored body; one mention token." },
      { name: "parseMentions(body)", type: "{ text, mentions[] }", description: "Plain text plus ids and offsets." },
      { name: "serializeMention(item)", type: "string", description: "\"@[Jane Cooper](user:42)\"." },
    ] },
  ],
  notes: [
    "Keyboard: the list is an ARIA feed — PageDown / PageUp move between comments. Reply moves focus into the reply box and back after sending.",
    "The mention picker follows the combobox pattern on the textarea (aria-autocomplete, aria-controls, aria-activedescendant) and announces the number of suggestions politely.",
  ],
  covers: ["Comment thread & mentions"],
};

export default entry;
