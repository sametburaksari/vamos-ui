import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { Lightbox, LightboxTrigger } from "./lightbox";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";
import type { MediaAsset, MediaSource } from "./types";

const photos: MediaSource[] = [
  { id: "p1", src: "https://cdn.example.com/office-entrance.jpg", alt: "Office entrance on Bağdat Avenue", width: 2000, height: 1333, caption: "Office entrance" },
  { id: "p2", src: "https://cdn.example.com/meeting-room.jpg", alt: "Meeting room with a long walnut table", width: 2000, height: 1333 },
  { id: "p3", src: "https://cdn.example.com/roof-terrace.jpg", alt: "Roof terrace at dusk", width: 1600, height: 2000, caption: "Roof terrace" },
];

function Viewer(props: Partial<React.ComponentProps<typeof Lightbox>>) {
  return (
    <Lightbox items={photos} {...props}>
      {photos.map((p, i) => (
        <LightboxTrigger key={p.id} index={i} aria-label={`Enlarge image: ${p.alt}`}>
          <img src={p.src} alt="" />
        </LightboxTrigger>
      ))}
    </Lightbox>
  );
}

describe("Lightbox", () => {
  it("opens as a labelled dialog at the clicked item and passes axe", async () => {
    const { user } = renderWithProviders(<Viewer download />);
    await user.click(screen.getByRole("button", { name: /Meeting room/ }));
    const dialog = await screen.findByRole("dialog", { name: "Image viewer" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Image 2 of 3: Meeting room with a long walnut table")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", photos[1]!.src);
    expect(screen.getByRole("button", { name: "Close viewer" })).toHaveFocus();
    await expectNoA11yViolations();
  });

  it("navigates with the arrow keys, wraps, and closes on Escape returning focus", async () => {
    const onIndexChange = vi.fn();
    const { user } = renderWithProviders(<Viewer onIndexChange={onIndexChange} />);
    const trigger = screen.getByRole("button", { name: /Roof terrace/ });
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{ArrowRight}");
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    expect(screen.getByText("Image 1 of 3: Office entrance")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("zooms with + / − / 0 and the toolbar", async () => {
    const { user } = renderWithProviders(<Viewer defaultOpen />);
    await screen.findByRole("dialog");
    const reset = screen.getByRole("button", { name: "Reset zoom" });
    expect(reset).toHaveTextContent("100%");
    await user.keyboard("+");
    expect(reset).toHaveTextContent("150%");
    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(reset).toHaveTextContent("200%");
    await user.keyboard("0");
    expect(reset).toHaveTextContent("100%");
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
  });

  it("shows the image error state", async () => {
    renderWithProviders(<Viewer defaultOpen thumbnails={false} />);
    const dialog = await screen.findByRole("dialog");
    const img = dialog.querySelector<HTMLImageElement>(`img[src="${photos[0]!.src}"]`)!;
    fireEvent.error(img);
    expect(screen.getAllByText("This image could not be loaded.").length).toBeGreaterThan(0);
  });

  it("shows file details for assets", async () => {
    const asset: MediaAsset = {
      id: "m_1",
      kind: "image",
      mime: "image/jpeg",
      filename: "q3-offsite-group.jpg",
      size: 2_516_582,
      url: "https://cdn.example.com/q3-offsite-group.jpg",
      width: 3000,
      height: 2000,
      alt: "",
      createdAt: "2026-10-14T10:00:00Z",
      uploadedBy: { id: "u1", name: "Elif Demir" },
    };
    const { user } = renderWithProviders(<Lightbox items={[asset]} info defaultOpen />);
    await user.click(await screen.findByRole("button", { name: "File details" }));
    const panel = screen.getByRole("complementary", { name: "File details" });
    expect(panel).toHaveTextContent("q3-offsite-group.jpg");
    expect(panel).toHaveTextContent("2.5 MB");
    expect(panel).toHaveTextContent("3,000 × 2,000");
    expect(panel).toHaveTextContent("Decorative (no alt text)");
    expect(panel).toHaveTextContent("Elif Demir");
  });
});
