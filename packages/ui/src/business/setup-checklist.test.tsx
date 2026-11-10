import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { SetupChecklist, SetupChecklistLauncher, type SetupItem } from "./setup-checklist";

const items: SetupItem[] = [
  { id: "store", title: "Connect your store", status: "done" },
  { id: "payments", title: "Connect payments", description: "Take cards and bank transfers through iyzico or Stripe.", status: "todo", action: { label: "Connect payments", href: "/settings/payments" }, estimate: "4 min" },
  { id: "domain", title: "Add your domain", status: "todo", locked: { reason: "Connect payments first." } },
  { id: "team", title: "Invite your team", status: "todo", optional: true, action: { label: "Invite", onSelect: () => {} } },
];

function Harness({ initial = items, onAllDone }: { initial?: SetupItem[]; onAllDone?: () => void }) {
  const [list, setList] = React.useState(initial);
  const [hidden, setHidden] = React.useState(false);
  return (
    <>
      <SetupChecklist
        items={list}
        dismissed={hidden}
        onDismissedChange={setHidden}
        onSkip={(id) => setList((l) => l.map((i) => (i.id === id ? { ...i, status: "skipped" } : i)))}
        onUndoSkip={(id) => setList((l) => l.map((i) => (i.id === id ? { ...i, status: "todo" } : i)))}
        onAllDone={onAllDone}
      />
      {hidden ? <SetupChecklistLauncher items={list} onOpen={() => setHidden(false)} /> : null}
      <button onClick={() => setList((l) => l.map((i) => ({ ...i, status: "done" })))}>finish</button>
    </>
  );
}

describe("SetupChecklist", () => {
  it("shows progress, status in item names, the first open step, and has no a11y violations", async () => {
    const { container } = render(<Harness />);
    expect(screen.getByRole("heading", { name: "Get started" })).toBeInTheDocument();
    expect(screen.getAllByText("1 of 4 complete").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Connect your store, done/ })).toBeInTheDocument();
    const payments = screen.getByRole("button", { name: /Connect payments, not started/ });
    expect(payments).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /Connect payments/ })).toHaveAttribute("href", "/settings/payments");
    expect(screen.getByRole("button", { name: /Add your domain, locked/ })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("toggles details with the disclosure button and supports skip + undo", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const team = screen.getByRole("button", { name: /Invite your team/ });
    await user.click(team);
    expect(team).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getAllByRole("button", { name: "Skip for now" }).at(-1)!);
    expect(screen.getByRole("button", { name: /Invite your team, skipped/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Invite your team, skipped/ }));
    await user.click(screen.getByRole("button", { name: /Undo skip/ }));
    expect(screen.getByRole("button", { name: /Invite your team, not started/ })).toBeInTheDocument();
  });

  it("dismisses to a launcher and reopens", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Hide setup guide" }));
    expect(screen.queryByRole("heading", { name: "Get started" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Setup guide · 1 of 4" }));
    expect(screen.getByRole("heading", { name: "Get started" })).toBeInTheDocument();
  });

  it("calls onAllDone once and shows the completion state", async () => {
    const user = userEvent.setup();
    const onAllDone = vi.fn();
    render(<Harness onAllDone={onAllDone} />);
    await user.click(screen.getByRole("button", { name: "finish" }));
    expect(screen.getByText("You're all set")).toBeInTheDocument();
    expect(onAllDone).toHaveBeenCalledTimes(1);
  });
});
