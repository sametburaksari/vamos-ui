import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { BlockImage } from "./block-image";
import type { VamosImageProps } from "../lib/provider";

const photo = { src: "/img/dining-room.jpg", alt: "The dining room at dusk, candles on oak tables", width: 2400, height: 1600 };

describe("BlockImage", () => {
  it("renders an intrinsic-size lazy image", async () => {
    const { container } = render(<BlockImage {...photo} />);
    const img = screen.getByRole("img", { name: photo.alt });
    expect(img).toHaveAttribute("width", "2400");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("crops to an aspect by focal point, with blur and priority", () => {
    const { container } = render(<BlockImage {...photo} aspect="4:5" focal={{ x: 0.3, y: 0.6 }} blurDataURL="data:image/png;base64,AAAA" priority />);
    const frame = container.querySelector(".vb-image") as HTMLElement;
    expect(frame.style.aspectRatio).toBe("4 / 5");
    expect(frame.style.getPropertyValue("--vb-focal")).toBe("30.0% 60.0%");
    expect(frame.style.backgroundImage).toContain("data:image/png");
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("decorative images have empty alt; captions use figure", () => {
    const { container, rerender } = render(<BlockImage src="/grain.png" width={10} height={10} decorative />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    rerender(<BlockImage {...photo} caption="Upstairs, seats 24." />);
    expect(screen.getByRole("figure")).toHaveTextContent("Upstairs, seats 24.");
  });

  it("uses the app's Image adapter with fill when cropped", () => {
    const seen: VamosImageProps[] = [];
    const NextLikeImage = (p: VamosImageProps) => {
      seen.push(p);
      return <img src={p.src} alt={p.alt} data-adapter="" />;
    };
    render(<BlockImage {...photo} aspect="3:2" sizes="50vw" components={{ Image: NextLikeImage }} />);
    expect(screen.getByRole("img")).toHaveAttribute("data-adapter");
    expect(seen[0]).toMatchObject({ fill: true, sizes: "50vw", width: undefined });
  });

  it("shows an add-image placeholder only in edit mode", () => {
    const { container, rerender } = render(<BlockImage />);
    expect(container).toBeEmptyDOMElement();
    rerender(<BlockImage editMode field="props.image" />);
    expect(screen.getByText("Add an image").parentElement).toHaveAttribute("data-field", "props.image");
  });
});
