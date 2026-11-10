import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Kbd, KbdGroup } from "./kbd";
import { LocaleProvider } from "../lib/locale";
import { tr } from "../locales/tr";

const setPlatform = (p: string) => Object.defineProperty(window.navigator, "platform", { value: p, configurable: true });

describe("Kbd", () => {
  afterEach(() => setPlatform(""));

  it("renders a plain key as <kbd> without a11y violations", async () => {
    const { container } = render(<p>Press <Kbd>Esc</Kbd> to close</p>);
    expect(container.querySelector("kbd")).toHaveTextContent("Esc");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders mod as Ctrl off Apple platforms with a spoken name", () => {
    setPlatform("Win32");
    render(<KbdGroup keys="mod+shift+k" data-testid="combo" />);
    const combo = screen.getByTestId("combo");
    expect(combo.tagName).toBe("KBD");
    expect(combo).toHaveAttribute("dir", "ltr");
    expect(combo.querySelectorAll("kbd")).toHaveLength(3);
    expect(combo).toHaveTextContent(/Ctrl.*Shift.*K/);
  });

  it("renders Apple symbols with screen-reader names in Apple order", () => {
    setPlatform("MacIntel");
    render(<KbdGroup keys="mod+shift+p" data-testid="combo" />);
    const keys = [...screen.getByTestId("combo").querySelectorAll("kbd")].map((k) => k.textContent);
    expect(keys).toEqual(["⇧Shift", "⌘Command", "P"]);
  });

  it("accepts key arrays, separators and localized names", async () => {
    setPlatform("Win32");
    const { container } = render(
      <LocaleProvider locale="tr-TR" messages={tr}>
        <KbdGroup keys={["g", "p"]} separator="then" />
        <Kbd keyName="backspace" />
      </LocaleProvider>,
    );
    expect(container.querySelector("[data-slot=kbd-group]")!.textContent).toBe("GthenP");
    expect(screen.getByText("Geri sil")).toHaveClass("sr-only");
    expect(await axe(container)).toHaveNoViolations();
  });
});
