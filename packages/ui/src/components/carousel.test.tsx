import * as React from "react";
import { screen } from "@testing-library/react";
import { Carousel, CarouselCounter, CarouselDots, CarouselSlide, CarouselViewport, Marquee, useCarousel } from "./carousel";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

// jsdom has no layout: give every slide a 300px box so the engine computes one snap per slide.
const KEYS = ["offsetWidth", "offsetHeight", "offsetLeft", "offsetTop"] as const;
const original = KEYS.map((k) => Object.getOwnPropertyDescriptor(HTMLElement.prototype, k));
beforeAll(() => {
  const indexOf = (el: HTMLElement) => (el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0);
  const isSlide = (el: HTMLElement) => el.dataset?.slot === "carousel-slide";
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get() { return 300; } });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get() { return 200; } });
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", { configurable: true, get() { return isSlide(this) ? indexOf(this) * 300 : 0; } });
  Object.defineProperty(HTMLElement.prototype, "offsetTop", { configurable: true, get() { return 0; } });
});
afterAll(() => {
  KEYS.forEach((k, i) => original[i] && Object.defineProperty(HTMLElement.prototype, k, original[i]!));
});

const stays = ["Moda loft", "Cihangir studio", "Bebek garden flat", "Karaköy rooftop"];

function Stays(props: Partial<React.ComponentProps<typeof Carousel>>) {
  return (
    <Carousel label="Featured stays" {...props}>
      <CarouselViewport>
        {stays.map((s) => (
          <CarouselSlide key={s}>
            <article>{s}</article>
          </CarouselSlide>
        ))}
      </CarouselViewport>
      <CarouselDots />
      <CarouselCounter />
    </Carousel>
  );
}

describe("Carousel", () => {
  it("follows the WAI-ARIA carousel pattern and passes axe", async () => {
    renderWithProviders(<Stays />);
    const region = screen.getByRole("region", { name: "Featured stays" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    const slides = screen.getAllByRole("group", { name: /of 4$/ });
    expect(slides).toHaveLength(4);
    expect(slides[2]).toHaveAttribute("aria-roledescription", "slide");
    expect(slides[2]).toHaveAccessibleName("3 of 4");
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    await expectNoA11yViolations();
  });

  it("moves with the dots and the keyboard (arrows, Home, End)", async () => {
    const onIndexChange = vi.fn();
    const { user } = renderWithProviders(<Stays onIndexChange={onIndexChange} />);
    await user.click(screen.getByRole("button", { name: "Go to slide 3" }));
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole("button", { name: "Go to slide 3" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("Slide 3 of 4")).toBeInTheDocument();
    await user.keyboard("{End}");
    expect(onIndexChange).toHaveBeenLastCalledWith(3);
    await user.keyboard("{Home}");
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
  });

  it("is controllable", () => {
    function Probe() {
      const { index } = useCarousel();
      return <output>current {index}</output>;
    }
    const { rerender } = renderWithProviders(
      <Carousel label="Quotes" index={1}>
        <CarouselViewport>
          <CarouselSlide>A</CarouselSlide>
          <CarouselSlide>B</CarouselSlide>
        </CarouselViewport>
        <Probe />
      </Carousel>,
    );
    expect(screen.getByText("current 1")).toBeInTheDocument();
    rerender(
      <Carousel label="Quotes" index={0}>
        <CarouselViewport>
          <CarouselSlide>A</CarouselSlide>
          <CarouselSlide>B</CarouselSlide>
        </CarouselViewport>
        <Probe />
      </Carousel>,
    );
    expect(screen.getByText("current 0")).toBeInTheDocument();
  });

  it("renders a pause button first when autoplay is on", () => {
    renderWithProviders(<Stays preset="hero" autoplay={{ delay: 4000 }} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAccessibleName(/autoplay/);
  });

  it("hides controls with a single slide and shows the empty state with none", () => {
    const { rerender } = renderWithProviders(
      <Carousel label="One">
        <CarouselViewport>
          <CarouselSlide>Only</CarouselSlide>
        </CarouselViewport>
        <CarouselDots />
      </Carousel>,
    );
    expect(screen.queryByRole("button", { name: "Next slide" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Go to slide/ })).toBeNull();
    rerender(
      <Carousel label="None">
        <CarouselViewport empty="No testimonials yet" />
      </Carousel>,
    );
    expect(screen.getByText("No testimonials yet")).toBeInTheDocument();
  });

  it("uses localized labels", () => {
    renderWithProviders(<Stays />, { locale: "tr-TR", messages: { carousel: { previous: "Önceki slayt", slideOf: "Slayt {index} / {total}" } } });
    expect(screen.getByRole("button", { name: "Önceki slayt" })).toBeInTheDocument();
    expect(screen.getAllByRole("group", { name: /Slayt \d \/ 4/ })).toHaveLength(4);
  });
});

describe("Marquee", () => {
  it("lists items once for assistive tech", async () => {
    renderWithProviders(
      <Marquee label="Customers">
        <span>Kahve Dünyası</span>
        <span>Moda Sahne</span>
      </Marquee>,
    );
    expect(screen.getByRole("list", { name: "Customers" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    await expectNoA11yViolations();
  });

  it("keeps the duplicate track out of the tab order and offers a pause control", async () => {
    const { container } = renderWithProviders(
      <Marquee label="Customers">
        <a href="/customers/kahve">Kahve Dünyası</a>
        <a href="/customers/moda">Moda Sahne</a>
      </Marquee>,
    );
    const copy = container.querySelector(".vui-marquee-track[aria-hidden]")!;
    expect(copy).toHaveAttribute("inert");
    expect(screen.getAllByRole("link")).toHaveLength(2);
    const pause = screen.getByRole("checkbox", { name: "Pause scrolling" });
    expect(pause).not.toBeChecked();
    pause.click();
    expect(pause).toBeChecked();
    await expectNoA11yViolations();
  });

  it("can drop the pause control", () => {
    renderWithProviders(<Marquee label="Customers" controls={false}><span>Moda Sahne</span></Marquee>);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});
