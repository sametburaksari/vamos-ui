import * as React from "react";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionNav } from "./section-nav";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

let callback: IntersectionObserverCallback | null = null;
const original = globalThis.IntersectionObserver;
beforeEach(() => {
  (globalThis as any).IntersectionObserver = class {
    constructor(cb: IntersectionObserverCallback) {
      callback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
});
afterEach(() => {
  (globalThis as any).IntersectionObserver = original;
  callback = null;
});

const items = [
  { id: "intro", label: "Introduction", meta: "01" },
  { id: "setup", label: "Setup", meta: "02" },
  { id: "usage", label: "Usage", meta: "03" },
];

function Page(props: Partial<React.ComponentProps<typeof SectionNav>>) {
  return (
    <div>
      <SectionNav items={items} {...props} />
      <main>
        {items.map((i) => (
          <section key={i.id} id={i.id} aria-label={String(i.label)}>
            <h2>{i.label}</h2>
          </section>
        ))}
      </main>
    </div>
  );
}

const enter = (id: string, top: number, isIntersecting = true) =>
  ({ target: document.getElementById(id)!, isIntersecting, boundingClientRect: { top } as DOMRectReadOnly }) as unknown as IntersectionObserverEntry;

describe("SectionNav", () => {
  it("is a labelled nav of in-page links that marks the section in view", async () => {
    const onActiveChange = vi.fn();
    const { container } = renderWithProviders(<Page onActiveChange={onActiveChange} />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(nav).toHaveClass("sticky");
    expect(screen.getByRole("link", { name: /Introduction/ })).toHaveAttribute("href", "#intro");
    act(() => callback!([enter("setup", 200), enter("usage", 500)], {} as IntersectionObserver));
    expect(screen.getByRole("link", { name: /Setup/ })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: /Usage/ })).not.toHaveAttribute("aria-current");
    expect(onActiveChange).toHaveBeenLastCalledWith("setup");
    // Leaving every section keeps the last one current.
    act(() => callback!([enter("setup", 0, false), enter("usage", 0, false)], {} as IntersectionObserver));
    expect(screen.getByRole("link", { name: /Setup/ })).toHaveAttribute("aria-current", "location");
    await expectNoA11yViolations(container);
  });

  it("clicking scrolls to the section, updates the hash and moves focus", async () => {
    const user = userEvent.setup();
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    renderWithProviders(<Page title="Contents" sticky={false} />);
    expect(screen.getByRole("navigation", { name: "Contents" })).not.toHaveClass("sticky");
    await user.click(screen.getByRole("link", { name: /Usage/ }));
    expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(window.location.hash).toBe("#usage");
    expect(document.getElementById("usage")).toHaveFocus();
    expect(screen.getByRole("link", { name: /Usage/ })).toHaveAttribute("aria-current", "location");
  });

  it("jumps instantly under reduced motion", async () => {
    const user = userEvent.setup();
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const mm = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: q.includes("reduce") })) as typeof window.matchMedia;
    renderWithProviders(<Page />);
    await user.click(screen.getByRole("link", { name: /Setup/ }));
    expect(scroll).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    window.matchMedia = mm;
  });
});
