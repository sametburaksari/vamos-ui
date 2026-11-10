import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { CommentThread, parseMentions, serializeMention, type CommentData, type MentionItem } from "./comment-thread";

const NOW = "2026-11-10T12:00:00Z";
const people: MentionItem[] = [
  { id: "42", label: "Jane Cooper", kind: "user", description: "Head of Operations" },
  { id: "7", label: "Daniel Brooks", kind: "user", description: "Account executive" },
];
const search = (q: string) => people.filter((p) => p.label.toLowerCase().includes(q.toLowerCase()));

const comments: CommentData[] = [
  { id: "c1", author: { id: "u2", name: "Daniel Brooks" }, body: "@[Jane Cooper](user:42) can you double-check the discount on line 3?", createdAt: "2026-11-10T11:30:00Z" },
  { id: "c2", parentId: "c1", author: { id: "u1", name: "Ayşe Kaya" }, body: "Fixed — it was 12%, not 15%.", createdAt: "2026-11-10T11:45:00Z", reactions: [{ key: "like", count: 2, reacted: true }] },
  { id: "c3", author: { id: "u1", name: "Ayşe Kaya" }, body: "Legal approved the new terms.", createdAt: "2026-11-09T09:00:00Z", resolved: true, resolvedBy: "Jane Cooper" },
  { id: "c4", parentId: "c3", author: { id: "u2", name: "Daniel Brooks" }, body: "Great, sending today.", createdAt: "2026-11-09T10:00:00Z" },
];

describe("parseMentions", () => {
  it("round-trips the stored format", () => {
    const body = `Hi ${serializeMention({ id: "42", label: "Jane Cooper", kind: "user" })}, see ${serializeMention({ id: "deal-118", label: "Q4 renewal", kind: "record" })}`;
    expect(body).toBe("Hi @[Jane Cooper](user:42), see #[Q4 renewal](record:deal-118)");
    const { text, mentions } = parseMentions(body);
    expect(text).toBe("Hi @Jane Cooper, see #Q4 renewal");
    expect(mentions).toEqual([
      expect.objectContaining({ id: "42", kind: "user", label: "Jane Cooper", start: 3, end: 15 }),
      expect.objectContaining({ id: "deal-118", kind: "record", start: 21 }),
    ]);
  });
});

describe("CommentThread", () => {
  it("renders a feed of articles with mention chips, replies, reactions and resolved collapse (a11y)", async () => {
    const { container } = render(<CommentThread comments={comments} currentUserId="u1" now={NOW} onSubmit={() => {}} onReact={() => {}} onResolve={() => {}} />);
    expect(screen.getByRole("feed", { name: "Comments" })).toBeInTheDocument();
    expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("@Jane Cooper")).toHaveAttribute("data-slot", "mention");
    expect(screen.getByRole("button", { name: "Like: 2" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Resolved by Jane Cooper")).toBeInTheDocument();
    // resolved thread replies are collapsed
    expect(screen.queryByText("Great, sending today.")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /Show · 1 reply/ }));
    expect(screen.getByText("Great, sending today.")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("empty and read-only states", () => {
    const { rerender } = render(<CommentThread comments={[]} onSubmit={() => {}} />);
    expect(screen.getByText("Start the conversation")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    rerender(<CommentThread comments={comments} readOnly onSubmit={() => {}} />);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button", { name: /Reply/ })).toBeNull();
  });

  it("mention picker: @ opens suggestions, arrows move, Enter inserts; Cmd+Enter submits serialized body", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CommentThread comments={[]} onSubmit={onSubmit} mentionSources={[{ search }]} />);
    const box = screen.getByRole("textbox");
    await user.type(box, "Thanks @da");
    const list = await screen.findByRole("listbox");
    expect(box).toHaveAttribute("aria-autocomplete", "list");
    expect(box).toHaveAttribute("aria-controls", list.id);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(box).toHaveAttribute("aria-activedescendant", options[0]!.id);
    await user.keyboard("{Enter}");
    await waitFor(() => expect(box).toHaveValue("Thanks @Daniel Brooks "));
    expect(screen.queryByRole("listbox")).toBeNull();
    await user.type(box, "for the update");
    await user.keyboard("{Control>}{Enter}{/Control}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      body: "Thanks @[Daniel Brooks](user:7) for the update",
      mentions: [expect.objectContaining({ id: "7" })],
      attachments: [],
    });
    await waitFor(() => expect(box).toHaveValue(""));
  });

  it("Escape closes the picker; no match message", async () => {
    const user = userEvent.setup();
    render(<CommentThread comments={[]} onSubmit={() => {}} mentionSources={[{ search }]} />);
    const box = screen.getByRole("textbox");
    await user.type(box, "@zz");
    expect(await screen.findByText("No one matches “zz”")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("No one matches “zz”")).toBeNull();
  });

  it("reply opens a focused composer and posts with parentId", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CommentThread comments={comments.slice(0, 2)} currentUserId="u1" now={NOW} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Reply to Daniel Brooks" }));
    const reply = screen.getByRole("textbox", { name: "Write a reply…" });
    await waitFor(() => expect(reply).toHaveFocus());
    await user.type(reply, "On it");
    await user.click(screen.getByRole("button", { name: "Reply" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ body: "On it", parentId: "c1" })));
  });

  it("own comments: edit inline and delete from the menu", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<CommentThread comments={[comments[2]!]} currentUserId="u1" now={NOW} onEdit={onEdit} onDelete={onDelete} onSubmit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "More actions for Ayşe Kaya's comment" }));
    await user.click(await screen.findByRole("menuitem", { name: "Edit" }));
    const editor = screen.getAllByRole("textbox")[0]!;
    expect(editor).toHaveValue("Legal approved the new terms.");
    await user.clear(editor);
    await user.type(editor, "Legal approved v3 of the terms.");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith("c3", "Legal approved v3 of the terms."));
    await user.click(screen.getByRole("button", { name: "More actions for Ayşe Kaya's comment" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("c3");
  });

  it("sending and failed states with retry", async () => {
    const onRetry = vi.fn();
    render(
      <CommentThread
        now={NOW}
        onRetry={onRetry}
        comments={[
          { id: "s", author: { id: "u1", name: "Ayşe Kaya" }, body: "Uploading the PO now", createdAt: NOW, status: "sending" },
          { id: "f", author: { id: "u1", name: "Ayşe Kaya" }, body: "Please confirm", createdAt: NOW, status: "failed" },
        ]}
      />,
    );
    expect(screen.getByText("Sending…")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Not sent");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("PageDown moves focus between comments (feed pattern)", () => {
    render(<CommentThread comments={[comments[0]!, comments[2]!]} now={NOW} />);
    const [first, second] = screen.getAllByRole("article");
    act(() => first!.focus());
    fireEvent.keyDown(first!, { key: "PageDown" });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second!, { key: "PageUp" });
    expect(first).toHaveFocus();
  });
});
