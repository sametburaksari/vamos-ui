import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Users } from "lucide-react";
import { LocaleProvider } from "../lib/locale";
import { Delta, Stat, StatDelta, StatGroup, StatLabel, StatTrend, StatValue } from "./stat";
import { Sparkline } from "./sparkline";

describe("Stat", () => {
  it("renders a dl with formatted value, delta and a summarised trend", async () => {
    const { container } = render(
      <Stat label="Visitors" icon={Users} value={28412} delta={0.124} trend={[4, 6, 5, 8, 7, 9, 12, 11, 14]} comparison="vs previous 30 days" />,
    );
    const dl = container.querySelector("dl")!;
    expect(dl).toHaveAttribute("data-slot", "stat");
    expect(screen.getByText("Visitors").tagName).toBe("DT");
    expect(screen.getByText("28,412").closest("dd")).toHaveAttribute("aria-describedby");
    const describedBy = screen.getByText("28,412").closest("dd")!.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)).toHaveTextContent("Trending up over the last 9 periods");
    expect(screen.getByText("+12.4%")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Up 12.4% vs previous 30 days")).toHaveClass("sr-only");
    expect(container.querySelector('[data-slot="delta"]')).toHaveAttribute("data-tone", "positive");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("intent lower-is-better colours a drop as good; neutral and zero", () => {
    const { container } = render(
      <div>
        <Delta value={-0.18} intent="lower-is-better" data-testid="a" />
        <Delta value={0.03} intent="lower-is-better" data-testid="b" />
        <Delta value={0} data-testid="c" />
        <Delta value={0.2} intent="neutral" data-testid="d" />
        <Delta value={null} data-testid="e" />
      </div>,
    );
    expect(screen.getByTestId("a")).toHaveAttribute("data-tone", "positive");
    expect(screen.getByTestId("a")).toHaveAttribute("data-trend", "down");
    expect(screen.getByTestId("b")).toHaveAttribute("data-tone", "negative");
    expect(screen.getByTestId("c")).toHaveAttribute("data-trend", "flat");
    expect(screen.getByText("No change")).toBeInTheDocument();
    expect(screen.getByTestId("d")).toHaveAttribute("data-tone", "neutral");
    expect(screen.getByTestId("e")).toHaveTextContent("No data");
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(4);
  });

  it("formats currency, compact and duration; tr-TR percent sign position", () => {
    render(
      <LocaleProvider locale="tr-TR" currency="TRY">
        <Stat label="Gelir" value={1240000} format="compact-currency" delta={0.124} />
        <Stat label="Süre" value={167} format="duration" />
      </LocaleProvider>,
    );
    expect(screen.getByText("+%12,4")).toBeInTheDocument();
    expect(screen.getByText(/1,2\s?Mn/)).toBeInTheDocument();
    expect(screen.getByText(/2 dk\.? 47 sn\.?/)).toBeInTheDocument();
  });

  it("states: loading, no data, error, target", () => {
    render(
      <div>
        <Stat label="Open deals" loading data-testid="loading" />
        <Stat label="Churn" value={null} />
        <Stat label="Revenue" error="Couldn't load revenue" errorAction={<button>Retry</button>} />
        <Stat label="Won this month" value={12840} format="currency" target={{ value: 46800 }} />
        <Stat label="Signups" value={520} target={{ value: 500 }} />
      </div>,
    );
    expect(screen.getByTestId("loading")).toHaveAttribute("aria-busy", "true");
    expect(screen.getAllByText("No data").length).toBeGreaterThan(0);
    expect(screen.getByText("Couldn't load revenue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByText("Goal $46,800")).toBeInTheDocument();
    expect(screen.getByText("27%")).toBeInTheDocument();
    expect(screen.getByText("Goal reached")).toBeInTheDocument();
  });

  it("href makes the whole stat a link; composition and group", async () => {
    const { container } = render(
      <StatGroup columns={3} variant="plain">
        <Stat variant="plain" label="Active partners" value={142} href="/partners" />
        <Stat variant="plain">
          <StatLabel>Avg. read time</StatLabel>
          <StatValue>2:47</StatValue>
          <StatDelta>
            <Delta value={-0.041} variant="badge" />
          </StatDelta>
          <StatTrend>
            <Sparkline values={[9, 8, 7, 5]} />
          </StatTrend>
        </Stat>
      </StatGroup>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/partners");
    expect(screen.getByText("2:47")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="stat-group"]')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
