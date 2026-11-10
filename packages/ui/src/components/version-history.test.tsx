import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { DiffView, FieldDiff, VersionHistory, diffRecords, diffText, type Version } from "./version-history";

const v1 = "Our studio builds fast websites.\nWe work with restaurants and clinics.\nBook a call today.";
const v2 = "Our studio builds fast, accessible websites.\nWe work with restaurants and clinics.\nBook a free call today.";

describe("diffText / diffRecords", () => {
  it("pairs changed lines and marks words", () => {
    const lines = diffText(v1, v2, "word");
    expect(lines.filter((l) => l.type === "del")).toHaveLength(2);
    expect(lines.filter((l) => l.type === "add")).toHaveLength(2);
    const added = lines.find((l) => l.type === "add")!;
    expect(added.segments?.filter((s) => s.kind === "add").map((s) => s.text).join("")).toContain("accessible");
  });

  it("compares records field by field", () => {
    expect(diffRecords({ amount: "48500.00", stage: "Proposal", owner: "Ayşe" }, { amount: "52000.00", stage: "Proposal", tags: ["renewal"] })).toEqual([
      { key: "amount", change: "changed", before: "48500.00", after: "52000.00" },
      { key: "stage", change: "same", before: "Proposal", after: "Proposal" },
      { key: "owner", change: "removed", before: "Ayşe", after: undefined },
      { key: "tags", change: "added", before: undefined, after: ["renewal"] },
    ]);
  });
});

describe("DiffView", () => {
  it("unified: ins/del, +/− gutters, SR text and stats (a11y)", async () => {
    const { container } = render(<DiffView before={v1} after={v2} beforeLabel="v11" afterLabel="v12" />);
    expect(screen.getByRole("region", { name: "Differences between v11 and v12" })).toBeInTheDocument();
    expect(screen.getByText("2 additions, 2 deletions")).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll("ins[data-word]")).map((n) => n.textContent).join("")).toContain("accessible");
    expect(screen.getAllByText("Added line:", { exact: false }).length).toBe(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("split view labels columns; identical message", async () => {
    const { rerender, container } = render(<DiffView mode="split" before={v1} after={v2} beforeLabel="Before" afterLabel="After" />);
    expect(container.querySelector(".ui-diff-head")).toHaveTextContent("BeforeAfter");
    expect(await axe(container)).toHaveNoViolations();
    rerender(<DiffView before="same" after="same" />);
    expect(screen.getByText("These versions are identical")).toBeInTheDocument();
  });

  it("collapses unchanged runs and navigates changes with n / p", async () => {
    const user = userEvent.setup();
    const base = Array.from({ length: 40 }, (_, i) => `Line ${i + 1}`);
    const after = [...base];
    after[2] = "Line three (edited)";
    after[35] = "Line thirty-six (edited)";
    render(<DiffView before={base.join("\n")} after={after.join("\n")} />);
    const gap = screen.getByRole("button", { name: /Show \d+ unchanged lines/ });
    const region = screen.getByRole("region");
    region.focus();
    await user.keyboard("n");
    expect(screen.getByText("Change 1 of 2")).toBeInTheDocument();
    await user.keyboard("n");
    expect(screen.getByText("Change 2 of 2")).toBeInTheDocument();
    await user.keyboard("p");
    expect(screen.getByText("Change 1 of 2")).toBeInTheDocument();
    await user.click(gap);
    expect(screen.getByText("Line 20")).toBeInTheDocument();
  });
});

describe("FieldDiff", () => {
  it("formats values and shows change badges", async () => {
    const { container } = render(
      <FieldDiff
        before={{ amount: 48500, stage: "Proposal", closeDate: "2026-12-01" }}
        after={{ amount: 52000, stage: "Negotiation", closeDate: "2026-12-01" }}
        fields={[
          { key: "amount", label: "Amount", format: "currency" },
          { key: "stage", label: "Stage" },
          { key: "closeDate", label: "Close date", format: "date" },
        ]}
      />,
    );
    expect(screen.getByText("$48,500.00").tagName).toBe("DEL");
    expect(screen.getByText("$52,000.00").tagName).toBe("INS");
    expect(screen.queryByText("Close date")).toBeNull();
    expect(screen.getAllByText("Changed")).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("VersionHistory", () => {
  const versions: Version[] = [
    { id: "v12", createdAt: "2026-11-10T09:00:00Z", label: "v12 · Pricing update", author: { name: "Ayşe Kaya" }, current: true },
    { id: "v11", createdAt: "2026-11-08T14:00:00Z", label: "v11", author: { name: "Daniel Brooks" }, kind: "published" },
    { id: "v10", createdAt: "2026-11-07T10:00:00Z", label: "v10", kind: "autosave" },
  ];
  const content: Record<string, string> = { v12: v2, v11: v1, v10: "Our studio builds websites." };

  it("defaults to newest non-current vs current, listbox two-selection (a11y)", async () => {
    const loadVersion = vi.fn(async (id: string) => content[id]!);
    const { container } = render(<VersionHistory versions={versions} loadVersion={loadVersion} defaultMode="unified" />);
    const list = screen.getByRole("listbox", { name: "Versions" });
    expect(list).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("option", { name: /v12/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: /v11/ })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(screen.getByRole("region", { name: /Differences between v11 and v12/ })).toBeInTheDocument());
    expect(loadVersion).toHaveBeenCalledWith("v11");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keyboard: ArrowDown + Space picks another version", async () => {
    const user = userEvent.setup();
    const onCompareChange = vi.fn();
    render(<VersionHistory versions={versions} loadVersion={(id) => content[id]!} onCompareChange={onCompareChange} />);
    const first = screen.getAllByRole("option")[0]!;
    first.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getAllByRole("option")[2]).toHaveFocus();
    await user.keyboard(" ");
    expect(onCompareChange).toHaveBeenLastCalledWith(["v12", "v10"]);
    expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "false");
  });

  it("restores the older version after confirming", async () => {
    const user = userEvent.setup();
    const onRestore = vi.fn();
    render(<VersionHistory versions={versions} loadVersion={(id) => content[id]!} onRestore={onRestore} />);
    await user.click(await screen.findByRole("button", { name: "Restore this version" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent(/Restore the version from/);
    await user.click(screen.getByRole("button", { name: "Restore" }));
    await waitFor(() => expect(onRestore).toHaveBeenCalledWith("v11"));
  });

  it("record versions render a field diff; load errors offer retry", async () => {
    const records: Record<string, Record<string, unknown>> = { v12: { price: 129, status: "Active" }, v11: { price: 99, status: "Active" } };
    const { rerender } = render(<VersionHistory versions={versions.slice(0, 2)} loadVersion={(id) => records[id]!} fields={[{ key: "price", label: "Price", format: "currency" }, { key: "status", label: "Status" }]} />);
    expect(await screen.findByText("$129.00")).toBeInTheDocument();
    rerender(<VersionHistory versions={versions.slice(1)} loadVersion={() => Promise.reject(new Error("500"))} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load this version.");
  });
});
