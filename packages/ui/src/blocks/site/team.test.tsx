import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Team, type TeamMember } from "./team";
import { teamBlock } from "./registry-2";

const photo = (alt: string) => ({ src: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800", alt, width: 800, height: 1000 });
const members: TeamMember[] = [
  { name: "Elif Aydın", role: "Lead therapist", specialty: "Deep tissue · Sports massage", photo: photo("Elif Aydın in the treatment room"), links: [{ network: "linkedin", href: "https://linkedin.com/in/elifaydin" }] },
  { name: "Mert Kaya", role: "Hammam master", specialty: "Traditional kese and foam" },
  { name: "Selin Öztürk", title: "Dr.", role: "Dermatologist", specialty: "Facials · Microneedling", photo: photo("Dr. Selin Öztürk") },
];

describe("Team", () => {
  it("portrait: list of members, honorific kept apart, text profile links", async () => {
    const { container } = render(<main><Team title="Hands you can *trust*" members={members} /></main>);
    expect(container.querySelector("ul")!.children).toHaveLength(3);
    expect(screen.getByRole("heading", { level: 3, name: "Dr. Selin Öztürk" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Elif Aydın on LinkedIn" })).toHaveAttribute("target", "_blank");
    // Missing photo: an empty inset area, never initials.
    expect(container.querySelector(".bg-surface-2[aria-hidden]")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("list: rows with role and specialty; hover portrait is decorative", async () => {
    const { container } = render(<main><Team variant="list" title="Specialists" members={members} /></main>);
    expect(screen.getByText("Traditional kese and foam")).toBeInTheDocument();
    container.querySelectorAll(".vb-team-hover img").forEach((img) => expect(img).toHaveAttribute("alt", ""));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("a single member falls back to feature with a signature name", async () => {
    const { container } = render(<main><Team title="Founded by a *therapist*" members={[{ ...members[0]!, bio: "Twelve years in Bali and Istanbul.\n\nOpened Lena Spa in 2019." }]} /></main>);
    expect(container.querySelector("section")).toHaveAttribute("data-variant", "feature");
    expect(container.querySelector(".vb-signature")).toHaveTextContent("Elif Aydın");
    expect(screen.getByText("Opened Lena Spa in 2019.")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    expect(teamBlock.schema.safeParse(teamBlock.sample()).success).toBe(true);
  });
});
