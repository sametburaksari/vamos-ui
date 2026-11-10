import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { StatusPicker, StatusBadge, type StatusDef } from "./status-picker";
import { LocaleProvider } from "../lib/locale";

function setup(ui: React.ReactElement) {
  return { ...render(<LocaleProvider locale="en-US">{ui}</LocaleProvider>), user: userEvent.setup() };
}
const noViolations = async () => expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();

const task: StatusDef[] = [
  { value: "todo", label: "To do", category: "todo" },
  { value: "doing", label: "In progress", category: "active" },
  { value: "review", label: "In review", category: "active", tone: "warning" },
  { value: "done", label: "Done", category: "done" },
];
const leave: StatusDef[] = [
  { value: "pending", label: "Pending", category: "todo", tone: "warning" },
  { value: "approved", label: "Approved", category: "done" },
  { value: "rejected", label: "Rejected", category: "cancelled", tone: "danger" },
];

describe("StatusPicker", () => {
  it("is a badge trigger with a descriptive name and passes axe", async () => {
    setup(<StatusPicker statuses={task} defaultValue="doing" />);
    const trigger = screen.getByRole("combobox", { name: "Status: In progress. Change" });
    expect(trigger).toHaveAttribute("data-category", "active");
    expect(trigger.querySelector("svg[data-category=active]")).not.toBeNull();
    await noViolations();
  });

  it("opens with the keyboard and changes status", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(<StatusPicker statuses={task} defaultValue="todo" onValueChange={onValueChange} />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Done" }));
    expect(onValueChange).toHaveBeenCalledWith("done", "todo", {});
    expect(screen.getByRole("combobox")).toHaveTextContent("Done");
    expect(screen.getByRole("status")).toHaveTextContent("Status changed to Done");
  });

  it("disables transitions that the workflow doesn't allow, with the reason", async () => {
    const { user } = setup(<StatusPicker statuses={leave} defaultValue="approved" transitions={{ pending: ["approved", "rejected"], approved: [], rejected: ["pending"] }} />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{Enter}");
    const rejected = await screen.findByRole("option", { name: "Rejected" });
    expect(rejected).toHaveAttribute("aria-disabled", "true");
    expect(rejected).toHaveAccessibleDescription("Not allowed from Approved");
  });

  it("confirms with a required note before a transition", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(
      <StatusPicker
        statuses={leave}
        defaultValue="pending"
        onValueChange={onValueChange}
        confirm={(s) => (s.value === "rejected" ? { title: "Reject this request?", requireNote: true, noteLabel: "Reason", tone: "danger", confirmLabel: "Reject" } : false)}
      />,
    );
    screen.getByRole("combobox").focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("option", { name: "Rejected" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Reject this request?" });
    const reject = screen.getByRole("button", { name: "Reject" });
    expect(reject).toBeDisabled();
    await user.type(screen.getByLabelText("Reason"), "Overlaps the Q4 release freeze");
    await user.click(reject);
    expect(onValueChange).toHaveBeenCalledWith("rejected", "pending", { note: "Overlaps the Q4 release freeze" });
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  });

  it("is optimistic for async saves and reverts on failure", async () => {
    let reject!: (e: Error) => void;
    const onError = vi.fn();
    const { user } = setup(<StatusPicker statuses={task} defaultValue="todo" onValueChange={() => new Promise((_, r) => (reject = r))} onError={onError} />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("option", { name: "In review" }));
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("In review");
    expect(trigger).toHaveAttribute("aria-busy", "true");
    reject(new Error("409 Conflict"));
    await waitFor(() => expect(trigger).toHaveTextContent("To do"));
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ value: "review" }));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't change the status. It's back to To do.");
  });

  it("read-only renders a plain badge", () => {
    setup(
      <>
        <StatusPicker statuses={task} value="done" readOnly />
        <StatusBadge status={leave[2]!} />
      </>,
    );
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Rejected").closest("[data-slot=status-badge]")).toHaveAttribute("data-category", "cancelled");
  });
});
