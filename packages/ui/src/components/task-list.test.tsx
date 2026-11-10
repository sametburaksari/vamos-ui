import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { TaskList, type TaskData } from "./task-list";

const TODAY = "2026-11-10";
const tasks: TaskData[] = [
  { id: "t1", title: "Send the signed contract", done: true, assignee: { id: "u1", name: "Ayşe Kaya" } },
  { id: "t2", title: "Schedule kickoff call", done: false, due: "2026-11-10", priority: "high", assignee: { id: "u2", name: "Daniel Brooks" } },
  { id: "t3", title: "Collect brand assets", done: false, due: "2026-11-07", priority: "urgent" },
  {
    id: "t4",
    title: "Set up workspace",
    done: false,
    due: "2026-11-11",
    children: [
      { id: "t4a", title: "Create Slack channel", done: true },
      { id: "t4b", title: "Invite client team", done: false },
    ],
  },
];

describe("TaskList", () => {
  it("renders checkboxes, progress, due tones, priority and subtasks (a11y)", async () => {
    const { container } = render(<TaskList title="Onboarding — Northwind" items={tasks} today={TODAY} onToggle={() => {}} />);
    expect(screen.getByRole("group", { name: "Onboarding — Northwind" })).toBeInTheDocument();
    expect(screen.getByText("2 of 6 done")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Send the signed contract" })).toBeChecked();
    expect(screen.getByText("Due Today")).toBeInTheDocument();
    expect(screen.getByText(/Overdue · 3 days ago/)).toBeInTheDocument();
    expect(screen.getByText("Due Tomorrow")).toBeInTheDocument();
    expect(screen.getByText("Urgent priority")).toBeInTheDocument();
    expect(screen.getByText("Assigned to Daniel Brooks")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Invite client team" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("toggles optimistically and reverts on failure", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn().mockRejectedValueOnce(new Error("offline"));
    render(<TaskList items={tasks} today={TODAY} onToggle={onToggle} />);
    const box = screen.getByRole("checkbox", { name: "Schedule kickoff call" });
    await user.click(box);
    expect(onToggle).toHaveBeenCalledWith("t2", true);
    await waitFor(() => expect(box).not.toBeChecked());
  });

  it("hides completed and collapses subtasks", async () => {
    const user = userEvent.setup();
    render(<TaskList items={tasks} today={TODAY} onToggle={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Hide completed" }));
    expect(screen.queryByRole("checkbox", { name: "Send the signed contract" })).toBeNull();
    expect(screen.getByRole("button", { name: "Show completed (2)" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: /^Show subtasks of “Set up workspace”/ }));
    expect(screen.queryByRole("checkbox", { name: "Invite client team" })).toBeNull();
  });

  it("Enter in the add input creates a task and keeps focus; edit and subtask add", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onEdit = vi.fn();
    render(<TaskList items={tasks.slice(1, 2)} today={TODAY} onToggle={() => {}} onAdd={onAdd} onEdit={onEdit} />);
    const add = screen.getByRole("textbox", { name: "Add a task" });
    await user.type(add, "Share meeting notes{Enter}");
    expect(onAdd).toHaveBeenCalledWith("Share meeting notes");
    await waitFor(() => expect(add).toHaveValue(""));
    await waitFor(() => expect(add).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "Edit task “Schedule kickoff call”" }));
    const edit = screen.getByRole("textbox", { name: "Edit task “Schedule kickoff call”" });
    await user.clear(edit);
    await user.type(edit, "Schedule kickoff call for Monday{Enter}");
    expect(onEdit).toHaveBeenCalledWith("t2", { title: "Schedule kickoff call for Monday" });

    await user.click(screen.getByRole("button", { name: "Add subtask to “Schedule kickoff call”" }));
    await user.type(screen.getByRole("textbox", { name: "Add subtask" }), "Send calendar invite{Enter}");
    expect(onAdd).toHaveBeenCalledWith("Send calendar invite", "t2");
  });

  it("Alt+ArrowDown reorders siblings", async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(<TaskList items={tasks.slice(0, 3)} today={TODAY} onToggle={() => {}} onReorder={onReorder} />);
    screen.getByRole("checkbox", { name: "Send the signed contract" }).focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(onReorder).toHaveBeenCalledWith(["t2", "t1", "t3"], undefined);
  });

  it("checklist variant, all done and empty", async () => {
    const { rerender, container } = render(<TaskList variant="checklist" items={[{ id: "a", title: "Featured image set", done: true }]} onToggle={() => {}} />);
    expect(screen.getByText("All done. Nice work.")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    rerender(<TaskList items={[]} />);
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });
});
