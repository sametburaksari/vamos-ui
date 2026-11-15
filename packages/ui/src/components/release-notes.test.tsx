import * as React from "react";
import { screen, within } from "@testing-library/react";
import { ReleaseNotes, releaseAnchor, type Release } from "./release-notes";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const releases: Release[] = [
  {
    version: "2.4.0",
    date: "2026-11-04",
    title: "Saved views",
    summary: "Keep a filtered list one click away.",
    href: "/changelog/2-4-0",
    changes: [
      { type: "added", title: "Save a filtered list as a view", description: "Views are shared with the workspace." },
      { type: "fixed", title: "Export kept the old column order" },
      { type: "deprecated", title: "The legacy CSV endpoint" },
    ],
  },
  {
    version: "2.3.1",
    date: "2026-10-21",
    changes: [{ type: "fixed", title: "Dates in reminders used the server time zone" }],
  },
];

describe("releaseAnchor", () => {
  it("slugs the version", () => {
    expect(releaseAnchor("4.12.0")).toBe("v4-12-0");
    expect(releaseAnchor("v1.0 beta", "release-")).toBe("release-1-0-beta");
  });
});

describe("ReleaseNotes", () => {
  it("renders releases with dates, versions, tags and anchors", async () => {
    const { container } = renderWithProviders(<ReleaseNotes releases={releases} />);
    const items = container.querySelectorAll("ol > li");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("id", "v2-4-0");
    const first = within(items[0] as HTMLElement);
    expect(first.getByRole("heading", { level: 2 })).toHaveTextContent("Saved views, v2.4.0");
    expect(first.getByText("November 4, 2026").closest("time")).toHaveAttribute("dateTime", "2026-11-04");
    expect(first.getByText("Added")).toBeInTheDocument();
    expect(first.getByText("Deprecated")).toBeInTheDocument();
    expect(first.getByRole("link", { name: "Link to version 2.4.0" })).toHaveAttribute("href", "#v2-4-0");
    expect(first.getByRole("link", { name: "Read the v2.4.0 notes" })).toHaveAttribute("href", "/changelog/2-4-0");
    // a release without a title uses its version as the heading
    expect(within(items[1] as HTMLElement).getByRole("heading", { level: 2 })).toHaveTextContent("v2.3.1");
    await expectNoA11yViolations(container);
  });

  it("groups by type under sub-headings", () => {
    renderWithProviders(<ReleaseNotes releases={releases} groupBy="type" headingLevel={3} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    const subs = screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent);
    expect(subs).toEqual(["Added", "Fixed", "Deprecated", "Fixed"]);
  });

  it("filters by type and announces the count", async () => {
    const { user, container } = renderWithProviders(<ReleaseNotes releases={releases} filter />);
    const group = screen.getByRole("toolbar", { name: "Show" });
    const added = within(group).getByRole("button", { name: /Added/ });
    expect(added).toHaveTextContent("Added1");
    await user.click(within(group).getByRole("button", { name: /Fixed/ }));
    expect(container.querySelectorAll("ol > li")).toHaveLength(1);
    expect(screen.getByText("1 release shown")).toBeInTheDocument();
    await user.click(added);
    await user.click(within(group).getByRole("button", { name: /Deprecated/ }));
    expect(screen.getByText("No changes match the filter.")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("takes custom types and labels", () => {
    renderWithProviders(
      <ReleaseNotes
        releases={[{ version: "1.0", date: "2026-09-01", changes: [{ type: "performance", title: "Faster search" }, { type: "fixed", title: "Typo" }] }]}
        types={{ performance: { label: "Performance", tone: "info" } }}
        labels={{ fixed: "Düzeltildi" }}
      />,
    );
    expect(screen.getByText("Performance")).toBeInTheDocument();
    expect(screen.getByText("Düzeltildi")).toBeInTheDocument();
  });
});
