import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Skeleton, SkeletonAvatar, SkeletonGroup, SkeletonRow, SkeletonText } from "./skeleton";
import { LocaleProvider } from "../lib/locale";
import { tr } from "../locales/tr";

describe("Skeleton", () => {
  it("hides placeholders and announces the region once", async () => {
    const { container } = render(
      <SkeletonGroup>
        <SkeletonAvatar />
        <SkeletonText lines={2} />
        <Skeleton className="h-4 w-32" />
      </SkeletonGroup>,
    );
    const group = container.firstElementChild!;
    expect(group).toHaveAttribute("aria-busy", "true");
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    container.querySelectorAll('[data-slot^="skeleton"]:not([data-slot="skeleton-group"])').forEach((el) => {
      expect(el.closest("[aria-hidden=true]")).not.toBeNull();
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("localizes the hidden label and stops being busy", () => {
    const { rerender } = render(
      <LocaleProvider locale="tr-TR" messages={tr}>
        <SkeletonGroup data-testid="g" />
      </LocaleProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Yükleniyor…");
    rerender(
      <LocaleProvider locale="tr-TR" messages={tr}>
        <SkeletonGroup data-testid="g" loading={false}>
          Loaded
        </SkeletonGroup>
      </LocaleProvider>,
    );
    expect(screen.getByTestId("g")).not.toHaveAttribute("aria-busy");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders text lines with a shorter last line and shimmer toggle", () => {
    const { container } = render(<SkeletonText lines={3} lastLineWidth="40%" shimmer={false} />);
    const lines = container.querySelectorAll('[data-slot="skeleton"]');
    expect(lines).toHaveLength(3);
    expect((lines[2] as HTMLElement).style.width).toBe("40%");
    expect(lines[0]).not.toHaveClass("ui-shimmer");
  });

  it("renders table rows with the requested columns", () => {
    const { container } = render(<SkeletonRow columns={5} avatar />);
    const row = container.querySelector('[data-slot="skeleton-row"]')!;
    expect(row.children).toHaveLength(5);
    expect(row.querySelector(".rounded-full.aspect-square")).not.toBeNull();
  });
});
