import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { SavedViews } from "./saved-views";
import { createListState, type SavedView, type ViewState } from "./types";
import { toViewState } from "./view-state";

const base = toViewState(createListState());
const hot: ViewState = { ...base, filters: { logic: "and", clauses: [{ id: "h", field: "score", op: "gte", value: 80 }] } };
const views: SavedView[] = [
  { id: "mine", name: "My open deals", scope: "personal", state: base },
  { id: "hot", name: "Hot leads", scope: "team", state: hot, ownerId: "u9" },
];

describe("SavedViews", () => {
  it("renders a tablist and passes axe", async () => {
    const { container } = render(<SavedViews variant="tabs" views={views} activeId="mine" current={base} onSelect={() => {}} onReset={() => {}} onSave={() => {}} />);
    expect(screen.getByRole("tablist", { name: "Views" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "My open deals" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("moves focus with arrows and activates manually with Enter", async () => {
    const onSelect = vi.fn();
    render(<SavedViews variant="tabs" views={views} activeId={null} current={base} onSelect={onSelect} onReset={() => {}} />);
    const user = userEvent.setup();
    screen.getByRole("tab", { name: "All" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "My open deals" })).toHaveFocus();
    expect(onSelect).not.toHaveBeenCalled();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("hot");
  });

  it("shows the modified strip; read-only team views can only be saved as new", async () => {
    const onReset = vi.fn();
    const onUpdate = vi.fn();
    render(
      <SavedViews variant="tabs" views={views} activeId="hot" current={base} onSelect={() => {}} onReset={onReset} onUpdate={onUpdate} onSave={() => {}} permissions={{ canEdit: (v) => v.ownerId === "me" }} />,
    );
    const user = userEvent.setup();
    expect(screen.getByRole("tab", { name: /Hot leads.*Modified/ })).toBeInTheDocument();
    expect(screen.getByText("View modified.")).toBeInTheDocument();
    const save = screen.getByRole("button", { name: "Save" });
    expect(save).toHaveAttribute("aria-disabled", "true");
    await user.click(save);
    expect(onUpdate).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalled();
  });

  it("creates a view through the dialog", async () => {
    const onSave = vi.fn(async ({ name }: { name: string }) => ({ id: "new", name, scope: "personal" as const, state: base }));
    const onSelect = vi.fn();
    render(<SavedViews variant="tabs" views={views} activeId="mine" current={base} onSelect={onSelect} onReset={() => {}} onSave={onSave} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Save current view" }));
    const dialog = await screen.findByRole("dialog", { name: "Save view" });
    await user.click(screen.getByRole("button", { name: "Save view" }));
    expect(await screen.findByText("Give the view a name.")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: /Name/ }), "Closing this quarter");
    await user.click(screen.getByRole("button", { name: "Save view" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ name: "Closing this quarter", scope: "personal", isDefault: false }));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith("new"));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  });
});
