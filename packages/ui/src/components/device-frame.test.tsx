import * as React from "react";
import { screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { DeviceFrame, DeviceScreens } from "./device-frame";
import { deviceFrameSize, deviceViewports } from "./device-frame-size";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("DeviceFrame", () => {
  it("is a labelled picture whose content is inert, at the device's own width", async () => {
    const { container } = renderWithProviders(
      <DeviceFrame statusBar="09:41" label="Today screen with three tasks">
        <button type="button">Add task</button>
      </DeviceFrame>,
    );
    const frame = screen.getByRole("img", { name: "Today screen with three tasks" });
    expect(frame).toHaveAttribute("data-device", "phone");
    const viewport = container.querySelector<HTMLElement>('[data-slot="device-screen"]')!;
    expect(viewport.style.width).toBe(`${deviceViewports.phone.width}px`);
    expect(viewport).toHaveAttribute("inert");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("is decorative without a label and live when interactive", async () => {
    const { container, rerender } = renderWithProviders(<DeviceFrame device="tablet">x</DeviceFrame>);
    expect(container.querySelector('[data-slot="device-frame"]')).toHaveAttribute("aria-hidden", "true");
    rerender(
      <DeviceFrame device="desktop" url="example.com/pricing" interactive label="Pricing page preview" viewportWidth={1024}>
        <a href="#plans">Plans</a>
      </DeviceFrame>,
    );
    expect(screen.getByRole("group", { name: "Pricing page preview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Plans" })).toBeInTheDocument();
    expect(screen.getByText("example.com/pricing")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("reserves the frame's aspect ratio for the server render", () => {
    const size = deviceFrameSize("phone");
    const html = renderToString(<DeviceFrame>screen</DeviceFrame>);
    expect(html).toContain(`aspect-ratio:${size.width} / ${size.height}`);
    expect(html).toContain(`max-width:${size.width}px`);
  });
});

describe("DeviceScreens", () => {
  it("shows the active screen and makes the others inert", () => {
    const screens = [
      { id: "plan", content: <p>Plan</p> },
      { id: "track", content: <p>Track</p> },
    ];
    const { container, rerender } = renderWithProviders(<DeviceScreens screens={screens} active="plan" />);
    const track = container.querySelector('[data-screen="track"]')!;
    expect(track).toHaveAttribute("inert");
    expect(track).toHaveAttribute("aria-hidden", "true");
    rerender(<DeviceScreens screens={screens} active="track" />);
    expect(container.querySelector('[data-screen="track"]')).toHaveAttribute("data-state", "active");
    expect(container.querySelector('[data-screen="plan"]')).toHaveAttribute("inert");
  });
});
