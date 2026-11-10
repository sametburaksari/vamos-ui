import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { Figure, FigureCaption, Image, ImageLoaderProvider, aspectRatioOf, focalToObjectPosition, getImageSources } from "./image";
import { VamosProvider } from "../lib/provider";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";
import type { MediaAsset } from "../media/types";

const asset: MediaAsset = {
  id: "m_91",
  kind: "image",
  mime: "image/jpeg",
  filename: "kadikoy-office-lobby.jpg",
  size: 482_113,
  url: "https://cdn.example.com/kadikoy-office-lobby.jpg",
  width: 2400,
  height: 1600,
  alt: "Lobby of the Kadıköy office with oak benches",
  focalPoint: { x: 0.62, y: 0.4 },
  placeholder: "data:image/jpeg;base64,AAAA",
  createdAt: "2026-11-02T09:12:00Z",
};

describe("Image helpers", () => {
  it("resolves aspect ratios and focal points", () => {
    expect(aspectRatioOf("16/9")).toBeCloseTo(16 / 9);
    expect(aspectRatioOf("1.91/1")).toBeCloseTo(1.91);
    expect(aspectRatioOf(2)).toBe(2);
    expect(aspectRatioOf("auto", 1200, 600)).toBe(2);
    expect(aspectRatioOf("auto")).toBeUndefined();
    expect(focalToObjectPosition({ x: 0.62, y: 0.4 })).toBe("62% 40%");
    expect(focalToObjectPosition({ x: 2, y: -1 })).toBe("100% 0%");
  });

  it("builds a srcset from the loader, capped at the intrinsic width", () => {
    const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality ?? 75}`;
    const s = getImageSources({ ...asset, width: 1000 }, { loader, widths: [320, 640, 1280] });
    expect(s.srcSet).toBe(`${asset.url}?w=320&q=75 320w, ${asset.url}?w=640&q=75 640w`);
    expect(s.sizes).toBe("100vw");
  });

  it("applies a named crop through the loader", () => {
    const calls: unknown[] = [];
    getImageSources({ ...asset, crops: { og: { x: 0, y: 100, width: 2400, height: 1256 } } }, { crop: "og", widths: [640], loader: (p) => (calls.push(p.crop), p.src) });
    expect(calls[0]).toEqual({ x: 0, y: 100, width: 2400, height: 1256 });
  });
});

describe("Image", () => {
  it("renders a sized, lazy image with focal position and passes axe", async () => {
    renderWithProviders(<Image src={asset} aspect="16/9" sizes="50vw" rounded="ui" />);
    const img = screen.getByRole("img", { name: asset.alt });
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("width", "2400");
    expect(img).toHaveStyle({ objectPosition: "62% 40%" });
    const wrapper = img.closest("[data-slot=image]")!;
    expect(wrapper).toHaveAttribute("data-placeholder", "blur");
    expect(wrapper).toHaveStyle({ aspectRatio: String(16 / 9) });
    await expectNoA11yViolations();
  });

  it("is eager with high fetch priority when priority is set", () => {
    renderWithProviders(<Image src={asset.url} alt="Hero" width={1600} height={900} priority />);
    const img = screen.getByRole("img", { name: "Hero" });
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("marks decorative images as presentation", () => {
    const { container } = renderWithProviders(<Image src={asset.url} alt="" width={10} height={10} placeholder="none" />);
    expect(container.querySelector("[data-slot=image] img:not([aria-hidden])")).toHaveAttribute("role", "presentation");
  });

  it("cross-fades on load and shows the fallback on error", () => {
    const { container } = renderWithProviders(<Image src={asset} />);
    const wrapper = container.querySelector("[data-slot=image]")!;
    const img = screen.getByRole("img", { name: asset.alt });
    expect(wrapper).toHaveAttribute("data-state", "loading");
    fireEvent.load(img);
    expect(wrapper).toHaveAttribute("data-state", "loaded");
    fireEvent.error(img);
    expect(wrapper).toHaveAttribute("data-state", "error");
    expect(screen.getByRole("img", { name: asset.alt })).toHaveAttribute("data-slot", "image-fallback");
  });

  it("shows a processing badge for processing assets", () => {
    renderWithProviders(<Image src={{ ...asset, status: "processing" }} />);
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("uses the loader from ImageLoaderProvider", () => {
    renderWithProviders(
      <ImageLoaderProvider loader={({ src, width }) => `${src}?width=${width}`}>
        <Image src={asset} widths={[480, 960]} />
      </ImageLoaderProvider>,
    );
    expect(screen.getByRole("img", { name: asset.alt }).getAttribute("srcset")).toContain("?width=960 960w");
  });

  it("renders through the injected Image bridge", () => {
    const Bridge = React.forwardRef<HTMLImageElement, Record<string, unknown>>(function Bridge({ fill, priority: _p, quality: _q, ...p }, ref) {
      return <img ref={ref} data-bridge={fill ? "fill" : "sized"} {...(p as React.ImgHTMLAttributes<HTMLImageElement>)} />;
    });
    renderWithProviders(
      <VamosProvider Image={Bridge as never}>
        <Image src={asset} aspect="1/1" />
      </VamosProvider>,
    );
    expect(screen.getByRole("img", { name: asset.alt })).toHaveAttribute("data-bridge", "fill");
  });

  it("warns when the alt text looks like a file name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithProviders(<Image src={asset.url} alt="IMG_2041.jpg" width={10} height={10} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("looks like a file name"));
    warn.mockRestore();
  });

  it("renders a captioned figure", async () => {
    renderWithProviders(
      <Figure>
        <Image src={asset} aspect="3/2" />
        <FigureCaption credit="Photo: Deniz Aksoy">The new reception, opened in October.</FigureCaption>
      </Figure>,
    );
    expect(screen.getByRole("figure")).toHaveTextContent("The new reception, opened in October.");
    await expectNoA11yViolations();
  });
});
