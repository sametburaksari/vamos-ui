import * as React from "react";
import { screen } from "@testing-library/react";
import { LengthMeter, LinkPreviewTabs, SearchPreview, SocialCardPreview, type LinkPreviewData } from "./link-preview";
import { countGraphemes, measureSerp } from "./serp";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const data: LinkPreviewData = {
  url: "https://bergamot.example/journal/website-sprint",
  title: "How We Run a Two-Week Website Sprint — Bergamot Studio",
  description: "Our website sprint takes ten working days from kickoff to launch: what we decide on day one, test on day five and ship on day ten.",
  siteName: "Bergamot Studio",
  publishedAt: "2026-11-08",
  image: { id: "og1", kind: "image", mime: "image/jpeg", filename: "sprint-og.jpg", size: 210_000, url: "https://cdn.example.com/sprint-og.jpg", width: 1200, height: 630, alt: "", createdAt: "2026-11-01T00:00:00Z" },
};

describe("serp measurement", () => {
  it("counts graphemes, not code units", () => {
    expect(countGraphemes("Café 👩‍💻")).toBe(6);
  });
  it("keeps short titles and cuts long ones at a word with an ellipsis", () => {
    expect(measureSerp("Bergamot Studio", "title").truncated).toBe(false);
    const long = measureSerp("Website design, development, copywriting and search consulting in Kadıköy, Moda and Bostancı for small teams", "title");
    expect(long.truncated).toBe(true);
    expect(long.display.endsWith(" …")).toBe(true);
    expect(long.px).toBeGreaterThan(long.maxPx);
  });
});

describe("SearchPreview", () => {
  it("renders the result as readable text with the keyword bolded and passes axe", async () => {
    renderWithProviders(<SearchPreview data={data} highlight="website sprint" />);
    const fig = screen.getByRole("figure", { name: "Search result preview" });
    expect(fig).toHaveTextContent("Bergamot Studio");
    expect(fig).toHaveTextContent("bergamot.example › journal › website-sprint");
    expect(fig).toHaveTextContent("Nov 8, 2026 —");
    expect(fig.querySelector("b")).toHaveTextContent("website sprint");
    await expectNoA11yViolations();
  });

  it("shows fallbacks and the noindex banner", () => {
    renderWithProviders(<SearchPreview data={{ url: "https://example.com", title: "", noindex: true }} />);
    expect(screen.getByText("Untitled page")).toHaveAttribute("data-missing");
    expect(screen.getByText(/Hidden from search engines/)).toBeInTheDocument();
  });
});

describe("SocialCardPreview", () => {
  it.each(["facebook", "linkedin", "x", "whatsapp", "slack"] as const)("renders %s with title and domain", async (platform) => {
    renderWithProviders(<SocialCardPreview data={data} platform={platform} />);
    const fig = screen.getByRole("figure", { name: /link preview/ });
    // X large cards show only the domain; Slack shows the site name.
    if (platform !== "x") expect(fig).toHaveTextContent(data.title);
    expect(fig.textContent?.toLowerCase()).toContain(platform === "slack" ? "bergamot studio" : "bergamot.example");
    await expectNoA11yViolations();
  });

  it("warns about a missing or wrongly sized image", () => {
    const { rerender } = renderWithProviders(<SocialCardPreview data={{ ...data, image: null }} platform="facebook" />);
    expect(screen.getByText(/No social image/)).toBeInTheDocument();
    rerender(<SocialCardPreview data={{ ...data, image: { ...(data.image as object), width: 800, height: 800 } as LinkPreviewData["image"] }} platform="facebook" />);
    expect(screen.getByText(/Image is 1:1\. Facebook shows 1\.91:1/)).toBeInTheDocument();
    expect(screen.getByText(/recommends at least 1200×630/)).toBeInTheDocument();
  });
});

describe("LengthMeter", () => {
  it("states the length in words, not only colour", () => {
    renderWithProviders(<LengthMeter value="Hammam Ritual — Defne Spa" field="title" label="SEO title" />);
    const meter = screen.getByRole("meter", { name: "SEO title" });
    expect(meter.getAttribute("aria-valuetext")).toMatch(/^25 of 60 characters, \d+ of 600 px: too short$/);
  });
  it("flags long and empty values", () => {
    const { rerender } = renderWithProviders(<LengthMeter value={"x".repeat(80)} max={60} label="Title" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "80 of 60 characters: too long");
    rerender(<LengthMeter value="" max={60} label="Title" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "0 of 60 characters: missing");
  });
});

describe("LinkPreviewTabs", () => {
  it("switches between search and social previews", async () => {
    const { user } = renderWithProviders(<LinkPreviewTabs data={data} />);
    expect(screen.getByRole("figure", { name: "Search result preview" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mobile" }));
    expect(screen.getByRole("figure", { name: "Search result preview" })).toHaveAttribute("data-device", "mobile");
    await user.click(screen.getByRole("tab", { name: "WhatsApp" }));
    expect(screen.getByRole("figure", { name: "WhatsApp link preview" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });
});
