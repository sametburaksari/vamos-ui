import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { CountUp, MotionScope, PageTransition, Reveal, SkeletonSwap, Stagger, TextReveal, Ticker, startPageTransition, motionLevel } from "./index";

/* A controllable IntersectionObserver: tests decide when something scrolls into view. */
const observed = new Map<Element, IntersectionObserverCallback>();
class TestIO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(el: Element) {
    observed.set(el, this.cb);
  }
  unobserve(el: Element) {
    observed.delete(el);
  }
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(globalThis as any).IntersectionObserver = TestIO;
const scrollIntoView = (el: Element) =>
  act(() => {
    observed.get(el)?.([{ target: el, isIntersecting: true, boundingClientRect: { top: 10 } } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
  });

let reduce = false;
const realMatchMedia = window.matchMedia;
beforeEach(() => {
  reduce = false;
  window.matchMedia = ((q: string) => ({
    matches: q.includes("reduce") ? reduce : false,
    media: q,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as any;
});
afterEach(() => {
  window.matchMedia = realMatchMedia;
  document.documentElement.removeAttribute("data-motion");
});

describe("Reveal / Stagger", () => {
  it("fresh content starts pending and reveals when it enters the viewport", () => {
    vi.useFakeTimers();
    render(<Reveal data-testid="r" effect="blur" delay={120}>Quarterly numbers</Reveal>);
    const el = screen.getByTestId("r");
    expect(el).toHaveAttribute("data-reveal", "blur");
    expect(el).toHaveAttribute("data-reveal-state", "pending");
    expect(el.style.getPropertyValue("--vm-delay")).toBe("120ms");
    scrollIntoView(el);
    expect(el).toHaveAttribute("data-reveal-state", "in");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(el).toHaveAttribute("data-reveal-state", "done");
    vi.useRealTimers();
  });

  it("reduced motion: shown at once, never observed", () => {
    reduce = true;
    render(<Reveal data-testid="r">Visible</Reveal>);
    const el = screen.getByTestId("r");
    expect(el).toHaveAttribute("data-reveal-state", "done");
    expect(observed.has(el)).toBe(false);
    expect(motionLevel(el)).toBe("off");
  });

  it('data-motion="off" on a scope or on <html> disables it', () => {
    render(
      <MotionScope level="off">
        <Reveal data-testid="a">A</Reveal>
      </MotionScope>,
    );
    expect(screen.getByTestId("a")).toHaveAttribute("data-reveal-state", "done");
    document.documentElement.setAttribute("data-motion", "off");
    render(
      <MotionScope level="full">
        <Reveal data-testid="b">B</Reveal>
      </MotionScope>,
    );
    expect(screen.getByTestId("b")).toHaveAttribute("data-reveal-state", "done");
  });

  it("motion levels resolve from the closest scope", () => {
    render(
      <MotionScope level="full">
        <span data-testid="f" />
      </MotionScope>,
    );
    expect(motionLevel(screen.getByTestId("f"))).toBe("full");
    expect(motionLevel(document.body)).toBe("subtle");
  });

  it("Stagger asChild keeps list semantics and passes the step", async () => {
    const { container } = render(
      <main>
        <Stagger asChild step={80}>
          <ul aria-label="Plans">
            <li>Starter</li>
            <li>Studio</li>
            <li>Agency</li>
          </ul>
        </Stagger>
      </main>,
    );
    const list = screen.getByRole("list", { name: "Plans" });
    expect(list).toHaveAttribute("data-reveal-stagger");
    expect(list.style.getPropertyValue("--vm-step")).toBe("80ms");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("CountUp", () => {
  it("screen readers get the final value only while it counts", () => {
    render(<CountUp value={1240} data-testid="c" />);
    const el = screen.getByTestId("c");
    expect(el).toHaveAttribute("data-running");
    expect(el).toHaveAttribute("data-ghost", "1,240");
    expect(screen.getByText("1,240")).toHaveClass("sr-only");
    expect(screen.getByText("0")).toHaveAttribute("aria-hidden", "true");
  });

  it("counts to the value after entering the viewport", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "requestAnimationFrame", "performance"] });
    render(<CountUp value={4.8} duration={400} data-testid="c" />);
    const el = screen.getByTestId("c");
    expect(screen.getByText("0.0")).toBeInTheDocument();
    scrollIntoView(el);
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(el).not.toHaveAttribute("data-running");
    expect(el).toHaveTextContent("4.8");
    vi.useRealTimers();
  });

  it("reduced motion: final value at once, formatted for the locale", () => {
    reduce = true;
    render(<CountUp value={1240} locale="tr-TR" data-testid="c" />);
    expect(screen.getByTestId("c")).not.toHaveAttribute("data-running");
    expect(screen.getByText("1.240")).not.toHaveClass("sr-only");
  });
});

describe("Ticker", () => {
  it("renders the items twice; the copy is aria-hidden and inert; pause control is labelled", async () => {
    const { container } = render(
      <main>
        <Ticker as="ul" duration={24} aria-label="Clients">
          {["Kestrel Bakery", "Harbor & Pine", "Northwind Studio", "Sable Clinic"].map((n) => (
            <li key={n}>
              <a href="https://example.com">{n}</a>
            </li>
          ))}
        </Ticker>
      </main>,
    );
    expect(container.querySelectorAll("li")).toHaveLength(8);
    const copy = container.querySelector("[data-marquee-copy]")!;
    expect(copy).toHaveAttribute("aria-hidden", "true");
    expect(copy).toHaveAttribute("inert");
    expect(screen.getAllByRole("link")).toHaveLength(4);
    const pause = screen.getByRole("checkbox", { name: "Pause animation" });
    fireEvent.click(pause);
    expect(pause).toBeChecked();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("TextReveal", () => {
  it("is one accessible string; the split copy is hidden", async () => {
    const { container } = render(
      <main>
        <TextReveal as="h2">Small rooms, slow mornings.</TextReveal>
      </main>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Small rooms, slow mornings." })).toBeInTheDocument();
    const units = container.querySelectorAll(".vm-tr-unit");
    expect(units).toHaveLength(4);
    expect((units[2] as HTMLElement).style.getPropertyValue("--vm-i")).toBe("2");
    expect(container.querySelector(".vm-text-reveal-visual")).toHaveAttribute("aria-hidden", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("line mode splits on new lines", () => {
    const { container } = render(<TextReveal as="p" by="line">{"Open late.\nClosed Mondays."}</TextReveal>);
    expect(container.querySelectorAll(".vm-tr-unit")).toHaveLength(2);
    expect(container.querySelector(".sr-only")).toHaveTextContent("Open late. Closed Mondays.");
  });

  it("keeps a real space between lines and words in textContent (search engines, reader mode)", () => {
    const { container } = render(<TextReveal as="h1" by="line">{"Ateşte közde,\nmuhabbet sofrada."}</TextReveal>);
    const h1 = container.querySelector("h1")!;
    const visual = container.querySelector(".vm-text-reveal-visual")!;
    expect(visual.textContent).toBe("Ateşte közde, muhabbet sofrada.");
    expect(h1.textContent).not.toMatch(/,muhabbet|\.Ateşte/);
    expect(h1.textContent!.replace(/\s+/g, " ").trim()).toBe("Ateşte közde, muhabbet sofrada. Ateşte közde, muhabbet sofrada.");
    const words = render(<TextReveal as="h2">{"Közde, muhabbet."}</TextReveal>).container.querySelector(".vm-text-reveal-visual")!;
    expect(words.textContent).toBe("Közde, muhabbet.");
  });
});

describe("PageTransition", () => {
  it("never animates the first render; animates every key change after", () => {
    const { rerender, container } = render(<PageTransition pageKey="overview">Overview</PageTransition>);
    expect(container.querySelector(".vm-page")).not.toHaveAttribute("data-page-enter");
    rerender(<PageTransition pageKey="billing">Billing</PageTransition>);
    expect(container.querySelector(".vm-page")).toHaveAttribute("data-page-enter");
  });

  it("startPageTransition falls back to a synchronous update without the API", () => {
    const update = vi.fn();
    expect(startPageTransition(update)).toBe("none");
    expect(update).toHaveBeenCalledOnce();
  });
});

describe("SkeletonSwap", () => {
  function Demo() {
    const [loading, setLoading] = React.useState(true);
    return (
      <>
        <button onClick={() => setLoading(false)}>Load</button>
        <SkeletonSwap loading={loading} skeleton={<div data-testid="sk">…</div>} data-testid="swap">
          <p>Invoice INV-2026-0412</p>
        </SkeletonSwap>
      </>
    );
  }

  it("busy while loading, cross-fades, then drops the skeleton", () => {
    vi.useFakeTimers();
    render(<Demo />);
    expect(screen.getByTestId("swap")).toHaveAttribute("aria-busy", "true");
    fireEvent.click(screen.getByText("Load"));
    expect(screen.getByTestId("swap")).not.toHaveAttribute("aria-busy");
    expect(screen.getByText("Invoice INV-2026-0412").parentElement).toHaveAttribute("data-entering");
    const skeleton = screen.getByTestId("sk").parentElement!;
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.queryByTestId("sk")).toBeNull();
    vi.useRealTimers();
  });

  it("reduced motion swaps at once", () => {
    reduce = true;
    render(<Demo />);
    fireEvent.click(screen.getByText("Load"));
    expect(screen.queryByTestId("sk")).toBeNull();
  });
});
