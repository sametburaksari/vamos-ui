import * as React from "react";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { ImageField, type ImageFieldValue } from "./image-field";
import { FocalPointPicker } from "./focal-point";
import { createMemoryAdapter } from "./memory-adapter";
import { mediaSeed } from "./test-fixtures";
import { Field } from "../components/input";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const adapter = () => createMemoryAdapter({ seed: mediaSeed, latency: 0, uploadDuration: 10 });
const harbour = mediaSeed[0]!;
const logo = mediaSeed[3]!;

describe("ImageField", () => {
  it("empty: a real button wired to the Field, opens the picker; passes axe", async () => {
    const { user } = renderWithProviders(
      <Field label="Featured image" hint="Shown on the blog index">
        <ImageField adapter={adapter()} />
      </Field>,
    );
    const button = screen.getByRole("button", { name: "Featured image" });
    expect(button).toHaveAccessibleDescription(/Shown on the blog index/);
    await expectNoA11yViolations();
    await user.click(button);
    expect(await screen.findByRole("dialog", { name: "Select image" })).toBeInTheDocument();
  });

  it("picks an image from the picker", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<ImageField adapter={adapter()} onChange={onChange} aria-label="Cover" />);
    await user.click(screen.getByRole("button", { name: /^Cover,/ }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getAllByRole("gridcell").length).toBeGreaterThan(0));
    await user.click(within(dialog).getByRole("gridcell", { name: /^harbour-sunrise\.jpg/ }));
    await user.click(within(dialog).getByRole("button", { name: "Use image" }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith({ asset: expect.objectContaining({ id: "m1" }) }));
    expect(await screen.findByRole("button", { name: /^Replace image: Fishing boats/ })).toBeInTheDocument();
  });

  it("filled: shows alt text, edits a per-use alt, warns on low resolution and removes", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<ImageField adapter={adapter()} defaultValue={{ asset: logo }} recommended={{ width: 1200, height: 630 }} onChange={onChange} />);
    expect(screen.getByText("Vamos logo")).toBeInTheDocument();
    expect(screen.getByText(/Low resolution: 400 × 210 px/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit alt text" }));
    const input = screen.getByRole("textbox", { name: "Alt text" });
    await user.clear(input);
    await user.type(input, "Vamos wordmark in lime{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ alt: "Vamos wordmark in lime" }));
    await expectNoA11yViolations();
    await user.click(screen.getByRole("button", { name: "Remove image" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("button", { name: /Set image/ })).toBeInTheDocument();
  });

  it("flags missing alt text and sets a focal point from the dialog", async () => {
    const onChange = vi.fn();
    const offsite = mediaSeed[1]!;
    const { user } = renderWithProviders(<ImageField adapter={adapter()} defaultValue={{ asset: offsite }} requireAlt onChange={onChange} />);
    expect(screen.getByText("Missing alt text")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Focal point" }));
    const dialog = await screen.findByRole("dialog", { name: "Set focal point" });
    const marker = within(dialog).getByRole("slider", { name: "Focal point" });
    marker.focus();
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}{ArrowUp}");
    expect(marker).toHaveAttribute("aria-valuetext", "horizontal 60%, vertical 49%");
    await user.click(within(dialog).getByRole("button", { name: "Save focal point" }));
    expect((onChange.mock.lastCall![0] as ImageFieldValue).focal).toEqual({ x: 0.6, y: 0.49 });
  });

  it("disabled and read-only states hide the editing actions", () => {
    renderWithProviders(<ImageField adapter={adapter()} defaultValue={{ asset: harbour }} readOnly />);
    expect(screen.queryByRole("button", { name: "Remove image" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Crop" })).not.toBeInTheDocument();
  });
});

describe("FocalPointPicker", () => {
  it("is a focusable 2-D control: arrows step 1%, Shift 10%, Home centres; passes axe", async () => {
    const onValueCommit = vi.fn();
    const { user } = renderWithProviders(<FocalPointPicker src={harbour} defaultValue={{ x: 0.62, y: 0.4 }} onValueCommit={onValueCommit} />);
    const marker = screen.getByRole("slider", { name: "Focal point" });
    expect(marker).toHaveAttribute("aria-roledescription", "focal point");
    expect(marker).toHaveAttribute("aria-valuetext", "horizontal 62%, vertical 40%");
    marker.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onValueCommit).toHaveBeenLastCalledWith({ x: 0.61, y: 0.4 });
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");
    expect(onValueCommit).toHaveBeenLastCalledWith({ x: 0.61, y: 0.5 });
    await user.keyboard("{Home}");
    expect(onValueCommit).toHaveBeenLastCalledWith({ x: 0.5, y: 0.5 });
    await expectNoA11yViolations();
  });

  it("moves the marker with the pointer", () => {
    const onValueCommit = vi.fn();
    renderWithProviders(<FocalPointPicker src={harbour.url} previews={false} onValueCommit={onValueCommit} />);
    const stage = document.querySelector("[data-slot=focal-point-stage]") as HTMLElement;
    stage.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 200, width: 400, height: 200, toJSON() {} }) as DOMRect;
    fireEvent.pointerDown(stage, { button: 0, clientX: 100, clientY: 150, pointerId: 1 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    expect(onValueCommit).toHaveBeenCalledWith({ x: 0.25, y: 0.75 });
  });
});
