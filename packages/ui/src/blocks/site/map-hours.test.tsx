import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { MapHours, directionsUrl, localBusinessJsonLd, type Branch } from "./map-hours";
import { site2LabelsTr } from "./shared/labels-2";
import { CONSENT_COOKIE, writeConsent } from "./shared/consent";
import { locationBlock } from "./registry-2";

const hours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    tue: [{ open: "12:00", close: "23:00" }],
    wed: [{ open: "12:00", close: "23:00" }],
    thu: [{ open: "12:00", close: "23:00" }],
    fri: [{ open: "12:00", close: "01:00" }],
    sat: [{ open: "12:00", close: "01:00" }],
    sun: [{ open: "12:00", close: "22:00" }],
  },
};
const branch: Branch = {
  name: "Meyhane Rasimpaşa",
  address: { line: "Rıhtım Caddesi 14", district: "Rasimpaşa", city: "Kadıköy", region: "İstanbul", postalCode: "34716", country: "TR", geo: { lat: 40.9112, lng: 29.1556 } },
  phone: "+902160000000",
  hours,
  mapImage: { src: "/maps/cevizli.png", alt: "", width: 1200, height: 900 },
  notes: "Parking on level −2 of Piazza, three hours free.",
};
// Tuesday 2026-11-10, 22:15 in Istanbul.
const NOW = "2026-11-10T22:15:00+03:00";

describe("MapHours", () => {
  afterEach(() => {
    document.cookie = `${CONSENT_COOKIE}=; max-age=0; path=/`;
  });

  it("hoursDisplay: open-days hides closed days, none drops the table", () => {
    const { unmount } = render(<MapHours branches={[branch]} now={NOW} hoursDisplay="open-days" />);
    const rows = within(screen.getByRole("table", { name: "Opening hours, Meyhane Rasimpaşa" })).getAllByRole("row");
    expect(rows).toHaveLength(6);
    expect(screen.queryByText("Monday")).toBeNull();
    unmount();
    render(<MapHours branches={[branch]} now={NOW} hoursDisplay="none" showOpenNow={false} businessType="EventVenue" />);
    expect(screen.queryByRole("table")).toBeNull();
    expect(localBusinessJsonLd({ branches: [branch], businessType: "EventVenue" })[0]?.["@type"]).toBe("EventVenue");
  });

  it("map-split: hours table with today marked, open-now status, directions", async () => {
    const { container } = render(<main><MapHours title="Find *us*" branches={[branch]} now={NOW} directions={["google", "apple", "yandex"]} /></main>);
    const table = screen.getByRole("table", { name: "Opening hours, Meyhane Rasimpaşa" });
    const today = within(table).getByRole("row", { current: "date" });
    expect(today).toHaveTextContent("Tuesday");
    expect(today).toHaveTextContent("12 PM–11 PM");
    expect(within(table).getAllByText("Closed")).toHaveLength(1);
    expect(await screen.findByText("Closing soon")).toBeInTheDocument();
    expect(screen.getByText(/open until 11 PM/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Yandex Maps/ })).toHaveAttribute("href", "https://yandex.com/maps/?rtext=~40.9112%2C29.1556");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("map facade loads the iframe only on click (and remembers the choice)", async () => {
    const user = userEvent.setup();
    const { container } = render(<MapHours branches={[branch]} now={NOW} />);
    expect(container.querySelector("iframe")).toBeNull();
    await user.click(screen.getByRole("checkbox", { name: "Always load maps" }));
    await user.click(screen.getByRole("button", { name: "Load map" }));
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute("title", "Map of Meyhane Rasimpaşa");
    expect(frame.getAttribute("src")).toContain("output=embed");
    expect(document.cookie).toContain(CONSENT_COOKIE);
  });

  it("loads automatically when functional consent is already granted", () => {
    act(() => {
      writeConsent({ functional: true });
    });
    const { container } = render(<MapHours branches={[branch]} now={NOW} />);
    expect(container.querySelector("iframe")).toBeInTheDocument();
  });

  it("info: three typographic columns in Turkish, Monday-first summary", async () => {
    const { container } = render(<main><MapHours variant="info" title="Adres" locale="tr-TR" labels={site2LabelsTr} branches={[branch]} now={NOW} /></main>);
    expect(screen.getByText("Pzt")).toBeInTheDocument();
    expect(screen.getByText("Kapalı")).toBeInTheDocument();
    expect(screen.getByText("Rasimpaşa/Kadıköy", { exact: false })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("branches: radio picker, keyboard switches location", async () => {
    const user = userEvent.setup();
    const b2: Branch = { ...branch, name: "Meyhane Moda", address: { ...branch.address, district: "Moda", city: "Kadıköy" } };
    const { container } = render(<main><MapHours variant="branches" title="Two *rooms*" branches={[branch, b2]} now={NOW} /></main>);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
    await user.click(radios[0]!);
    await user.keyboard("{ArrowDown}");
    expect(radios[1]).toBeChecked();
    expect(container.querySelectorAll(".vb-branch-panel")).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("JSON-LD, direction URLs and registry preview", () => {
    const [ld] = localBusinessJsonLd({ branches: [branch], businessType: "Restaurant" });
    expect(ld).toMatchObject({ "@type": "Restaurant", telephone: "+902160000000", geo: { latitude: 40.9112 } });
    expect((ld!.openingHoursSpecification as unknown[]).length).toBe(6);
    expect(directionsUrl("google", branch)).toBe("https://www.google.com/maps/dir/?api=1&destination=40.9112%2C29.1556");
    expect(locationBlock.schema.safeParse(locationBlock.sample()).success).toBe(true);
  });
});
