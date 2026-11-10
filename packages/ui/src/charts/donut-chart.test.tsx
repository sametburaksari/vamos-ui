import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { DonutChart } from "./donut-chart";

const leads = [
  { source: "organic", leads: 420 },
  { source: "paid", leads: 310 },
  { source: "referral", leads: 160 },
  { source: "events", leads: 70 },
  { source: "partners", leads: 25 },
  { source: "other-social", leads: 15 },
];
const config = {
  organic: { label: "Organic search" },
  paid: { label: "Paid ads" },
  referral: { label: "Referrals" },
  events: { label: "Events" },
  partners: { label: "Partners" },
  "other-social": { label: "Social" },
};

describe("DonutChart", () => {
  it("renders a legend list with values and shares, and a total in the centre", async () => {
    const { container } = render(<DonutChart title="Leads by source" data={leads} nameKey="source" valueKey="leads" config={config} maxSlices={6} animate={false} />);
    const list = screen.getByRole("list", { name: "Series" });
    const first = within(list).getByRole("button", { name: /Organic search/ });
    expect(first).toHaveTextContent("420");
    expect(first).toHaveTextContent("42%");
    expect(container.querySelector('[data-slot="chart"]')).toHaveTextContent("1,000");
    expect(screen.getByRole("figure", { name: "Leads by source" })).toHaveAccessibleDescription(/Organic search 42% \(420\)/);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("groups the tail into Other", () => {
    render(<DonutChart title="Leads" data={leads} nameKey="source" valueKey="leads" config={config} maxSlices={4} animate={false} />);
    const list = screen.getByRole("list", { name: "Series" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(within(list).getByRole("button", { name: /Other/ })).toHaveTextContent("110");
  });

  it("focusing a legend item activates its slice; clicking hides it", async () => {
    const user = userEvent.setup();
    const onActive = vi.fn();
    render(<DonutChart title="Leads" data={leads.slice(0, 3)} nameKey="source" valueKey="leads" config={config} onActiveChange={onActive} animate={false} />);
    await user.tab();
    expect(onActive).toHaveBeenLastCalledWith("organic");
    await user.keyboard("{Enter}");
    const organic = screen.getByRole("button", { name: /Organic search/ });
    expect(organic).toHaveAttribute("aria-pressed", "false");
    // shares are recomputed over the visible slices
    expect(screen.getByRole("button", { name: /Paid ads/ })).toHaveTextContent("66");
  });

  it("shows an empty ring when every value is zero", () => {
    render(<DonutChart title="Leads" data={[{ source: "organic", leads: 0 }]} nameKey="source" valueKey="leads" config={config} animate={false} />);
    expect(screen.getAllByText("No data for this range").length).toBeGreaterThan(0);
  });
});
