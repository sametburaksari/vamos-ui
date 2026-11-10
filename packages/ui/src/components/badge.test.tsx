import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Badge } from "./badge";
import { LocaleProvider } from "../lib/locale";
import { tr } from "../locales/tr";

describe("Badge", () => {
  it("renders tones, dot and forwards refs", async () => {
    const ref = { current: null as HTMLSpanElement | null };
    const { container } = render(
      <Badge ref={ref} tone="success" dot>
        Published
      </Badge>,
    );
    expect(ref.current).toHaveTextContent("Published");
    expect(ref.current).toHaveAttribute("data-tone", "success");
    expect(container.querySelector("[aria-hidden]")).not.toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("caps counts with tabular figures", () => {
    render(
      <>
        <Badge count={7} data-testid="a" />
        <Badge count={128} data-testid="b" />
        <Badge count={1500} max={999} data-testid="c" />
      </>,
    );
    expect(screen.getByTestId("a")).toHaveTextContent("7");
    expect(screen.getByTestId("b")).toHaveTextContent("99+");
    expect(screen.getByTestId("c")).toHaveTextContent("999+");
    expect(screen.getByTestId("b")).toHaveClass("tabular");
  });

  it("is a removable chip: click, Delete and Backspace remove", async () => {
    const onRemove = vi.fn();
    const { container } = render(<Badge onRemove={onRemove}>Design</Badge>);
    const btn = screen.getByRole("button", { name: "Remove Design" });
    await userEvent.click(btn);
    btn.focus();
    await userEvent.keyboard("{Delete}");
    await userEvent.keyboard("{Backspace}");
    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("localizes the remove label and honours removeLabel", () => {
    render(
      <LocaleProvider locale="tr-TR" messages={tr}>
        <Badge onRemove={() => {}}>Tasarım</Badge>
        <Badge onRemove={() => {}} removeLabel="Filtreyi temizle">
          <span>Durum: Taslak</span>
        </Badge>
      </LocaleProvider>,
    );
    expect(screen.getByRole("button", { name: "Tasarım kaldır" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtreyi temizle" })).toBeInTheDocument();
  });

  it("disabled chips can't be removed", () => {
    render(<Badge onRemove={() => {}} disabled>Locked</Badge>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("asChild renders a link and custom colours set --tone", async () => {
    const { container } = render(
      <>
        <Badge asChild tone="info">
          <a href="/posts?status=scheduled">Scheduled</a>
        </Badge>
        <Badge color="#7c3aed" data-testid="c">
          VIP
        </Badge>
      </>,
    );
    expect(screen.getByRole("link", { name: "Scheduled" })).toHaveAttribute("data-slot", "badge");
    expect(screen.getByTestId("c").style.getPropertyValue("--tone")).toBe("#7c3aed");
    expect(await axe(container)).toHaveNoViolations();
  });
});
