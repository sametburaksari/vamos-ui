import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ApprovalActions, ApprovalFlow, ApprovalSummary, type ApprovalStageData } from "./approval-flow";

const stages: ApprovalStageData[] = [
  {
    id: "manager",
    title: "Manager approval",
    mode: "all",
    status: "approved",
    approvers: [{ id: "u1", name: "Ayşe Yılmaz", role: "Engineering manager", decision: { value: "approved", at: "2026-11-03T11:02:00Z", note: "Fine by me — covered by Mert." } }],
  },
  {
    id: "finance",
    title: "Finance",
    mode: "any",
    status: "active",
    dueAt: "2026-11-05T17:00:00Z",
    parallelGroup: "p1",
    approvers: [
      { id: "u2", name: "Kerem Demir" },
      { id: "u3", name: "Elif Şahin" },
    ],
  },
  { id: "legal", title: "Legal", mode: "all", status: "approved", parallelGroup: "p1", approvers: [{ id: "u4", name: "Zeynep Kaya", decision: { value: "approved", at: "2026-11-04T08:30:00Z" } }] },
  { id: "director", title: "Director", mode: "all", status: "waiting", condition: "Amount > $10,000", approvers: [{ id: "u5", name: "Can Öztürk" }] },
];

describe("ApprovalFlow", () => {
  it("renders an ordered list of stages with decisions, parallel branches and SLA, without a11y violations", async () => {
    const { container } = render(<ApprovalFlow stages={stages} requester={{ name: "Deniz Aydın", at: "2026-11-03T09:12:00Z" }} now="2026-11-07T09:00:00Z" />);
    const list = screen.getByRole("list", { name: "Approval flow" });
    expect(list.tagName).toBe("OL");
    expect(screen.getByText("Submitted by Deniz Aydın")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "In parallel" })).toBeInTheDocument();
    expect(screen.getByText("Any one of 2 approvers")).toBeInTheDocument();
    expect(screen.getByText(/Overdue · due 2 days ago/)).toBeInTheDocument();
    expect(screen.getByText("Only when Amount > $10,000")).toBeInTheDocument();
    expect(screen.getByText("Fine by me — covered by Mert.")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("compact summary counts approved stages", () => {
    render(<ApprovalSummary stages={stages} />);
    expect(screen.getByText(/2 of 4 approved/)).toBeInTheDocument();
    expect(screen.getByText(/Now: Finance/)).toBeInTheDocument();
  });
});

describe("ApprovalActions", () => {
  it("requires a note to reject, focuses it, then calls onReject and announces", async () => {
    const user = userEvent.setup();
    const onReject = vi.fn().mockResolvedValue(undefined);
    render(<ApprovalActions canAct onApprove={vi.fn()} onReject={onReject} />);
    await user.click(screen.getByRole("button", { name: /Reject/ }));
    const dialog = await screen.findByRole("dialog", { name: "Reject request" });
    const note = within(dialog).getByRole("textbox", { name: /Note/ });
    await waitFor(() => expect(note).toHaveFocus());
    await user.click(within(dialog).getByRole("button", { name: "Reject request" }));
    expect(onReject).not.toHaveBeenCalled();
    expect(within(dialog).getByText("A note is required.")).toBeInTheDocument();
    await user.type(note, "Budget is frozen until Q1.");
    await user.click(within(dialog).getByRole("button", { name: "Reject request" }));
    expect(onReject).toHaveBeenCalledWith("Budget is frozen until Q1.");
    expect(await screen.findByText("Rejected")).toBeInTheDocument();
  });

  it("delegates to a chosen person", async () => {
    const user = userEvent.setup();
    const onDelegate = vi.fn();
    render(<ApprovalActions canAct onApprove={vi.fn()} onReject={vi.fn()} onDelegate={onDelegate} delegates={[{ id: "u9", name: "Selin Arslan" }]} />);
    await user.click(screen.getByRole("button", { name: /Delegate/ }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Selin Arslan" }));
    await user.click(within(dialog).getByRole("button", { name: "Delegate request" }));
    expect(onDelegate).toHaveBeenCalledWith({ id: "u9", name: "Selin Arslan" }, undefined);
  });

  it("explains when the viewer can't act", () => {
    render(<ApprovalActions canAct={false} onApprove={vi.fn()} onReject={vi.fn()} cantActReason="Waiting for Finance." />);
    expect(screen.getByText("Waiting for Finance.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
