import * as React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { UserPicker, type PickerUser } from "./user-picker";
import { clearRecordPickerCache } from "./record-picker";
import { LocaleProvider } from "../lib/locale";

function setup(ui: React.ReactElement) {
  return { ...render(<LocaleProvider locale="en-US">{ui}</LocaleProvider>), user: userEvent.setup() };
}
const noViolations = async () => expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();

const people: PickerUser[] = [
  { id: "u1", name: "Ayşe Demir", email: "ayse@northwind.com", meta: "Account executive", status: "online" },
  { id: "u2", name: "Mehmet Kaya", email: "mehmet@northwind.com", meta: "Support lead", status: "away" },
  { id: "u3", name: "Priya Raman", email: "priya@northwind.com", meta: "Designer" },
  { id: "u4", name: "Jonas Weber", email: "jonas@northwind.com", meta: "Left in June", disabled: true },
];

beforeEach(() => clearRecordPickerCache());

describe("UserPicker", () => {
  it("lists people with presence and role, sorted by name, and passes axe", async () => {
    const { user } = setup(<UserPicker aria-label="Owner" source={people} />);
    const trigger = screen.getByRole("button", { name: "Owner" });
    expect(trigger).toHaveTextContent("Unassigned");
    await user.click(trigger);
    const options = await screen.findAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([
      expect.stringContaining("Ayşe Demir"),
      expect.stringContaining("Jonas Weber"),
      expect.stringContaining("Mehmet Kaya"),
      expect.stringContaining("Priya Raman"),
    ]);
    expect(screen.getByRole("option", { name: /Jonas Weber/ })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("option", { name: /Jonas Weber/ })).toHaveTextContent("Deactivated");
    await noViolations();
  });

  it("assigns to me and marks the current user", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(<UserPicker aria-label="Assignee" source={people} currentUserId="u2" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Assignee" }));
    expect(await screen.findByRole("option", { name: /Mehmet Kaya \(you\)/ })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Assign to me" }));
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("u2", expect.objectContaining({ name: "Mehmet Kaya" })));
  });

  it("searches name, email and role", async () => {
    const { user } = setup(<UserPicker aria-label="Reviewer" source={people} />);
    await user.click(screen.getByRole("button", { name: "Reviewer" }));
    await user.type(await screen.findByRole("combobox"), "designer");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(screen.getByRole("option")).toHaveTextContent("Priya Raman");
  });

  it("avatar trigger is named with the assignees", async () => {
    setup(<UserPicker multiple trigger="avatars" source={people} defaultValue={["u1", "u2", "u3"]} roleLabel="Assignees" />);
    expect(await screen.findByRole("button", { name: "Assignees: Ayşe Demir, Mehmet Kaya and 1 more" })).toBeInTheDocument();
  });

  it("picking a team adds its members", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(
      <UserPicker
        multiple
        aria-label="Share with"
        source={people}
        teams={[{ id: "support", name: "Support", memberCount: 2 }]}
        getTeamMembers={async () => [people[1]!, people[3]!]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Share with" }));
    const teams = await screen.findByRole("group", { name: "Teams" });
    await user.click(within(teams).getByRole("option", { name: /Support/ }));
    // deactivated members are skipped
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["u2"], expect.any(Array)));
  });

  it("keeps the results of two pickers with different people apart (per-array cache key)", async () => {
    const staff: PickerUser[] = [{ id: "s1", name: "Emre Tunç" }, { id: "s2", name: "Zeynep Acar" }];
    const { user } = setup(
      <>
        <UserPicker aria-label="Owner" source={people} />
        <UserPicker aria-label="Shift lead" source={staff} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Owner" }));
    expect(await screen.findByRole("option", { name: /Ayşe Demir/ })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Shift lead" }));
    expect(await screen.findByRole("option", { name: /Emre Tunç/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Ayşe Demir/ })).toBeNull();
  });
});
