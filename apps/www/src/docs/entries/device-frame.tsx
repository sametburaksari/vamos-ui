import { ex, type DocEntry } from "../types";
import DeviceFrameDemo from "../examples/device-frame/demo";
import DeviceFrameTabs from "../examples/device-frame/tabs";
import DeviceFrameScroll from "../examples/device-frame/scroll";
import DeviceFrameDevices from "../examples/device-frame/devices";

const entry: DocEntry = {
  slug: "device-frame",
  title: "Device frame",
  group: "Media",
  description:
    "A phone, tablet or desktop browser drawn from tokens, with a screen that lays its content out at the device's real width and scales the frame to fit its container. Fill it with live components instead of screenshots; DeviceScreens swaps screens for feature tabs or scroll-synced chapters.",
  source: ["components/device-frame.tsx"],
  usage: `import { DeviceFrame, DeviceScreens } from "@vamos-ui/react";

<DeviceFrame device="phone" statusBar="09:41" label="Today screen: three tasks due">
  <TodayScreen />
</DeviceFrame>

<DeviceFrame label={current.alt}>
  <DeviceScreens active={tab} screens={features.map((f) => ({ id: f.id, content: f.screen }))} />
</DeviceFrame>

<DeviceFrame device="desktop" url="example.com/pricing" interactive label="Pricing page preview">
  <PricingPage />
</DeviceFrame>`,
  demo: ex("demo", "Demo", "device-frame/demo.tsx", DeviceFrameDemo),
  examples: [
    ex("tabs", "With feature tabs", "device-frame/tabs.tsx", DeviceFrameTabs, "Tabs drive one phone; every screen stays mounted and slides in. The frame's label follows the tab."),
    ex("scroll", "Scroll-synced", "device-frame/scroll.tsx", DeviceFrameScroll, "An IntersectionObserver picks the chapter crossing the middle; on a page use the viewport as root and a sticky frame."),
    ex("devices", "Tablet and desktop", "device-frame/devices.tsx", DeviceFrameDevices, "The same page at 820 and 1280 px; @container queries inside the screen switch the layout. interactive makes it a live, scrollable preview."),
  ],
  api: [
    { name: "DeviceFrame", props: [
      { name: "device", type: '"phone" | "tablet" | "desktop"', default: '"phone"', description: "Frame shape. Desktop is a browser window." },
      { name: "viewportWidth / viewportHeight", type: "number", description: "Simulated screen size in CSS px (defaults 390×844, 820×1180, 1280×800)." },
      { name: "maxScale", type: "number", default: "1", description: "Largest scale; the frame never grows past it." },
      { name: "statusBar", type: "ReactNode", description: "Time at the start of a phone / tablet status bar. Omit to hide the bar." },
      { name: "url", type: "string", description: "Address in the desktop browser bar." },
      { name: "interactive", type: "boolean", default: "false", description: "Live content that scrolls inside. Otherwise the content is inert and hidden from assistive technology." },
      { name: "label", type: "string", description: "What the screen shows (role=\"img\" name, or the group's name when interactive). Without it a static frame is decorative." },
      { name: "screenClassName", type: "string", description: "Classes for the screen element (laid out at the viewport size, an @container)." },
    ] },
    { name: "DeviceScreens", props: [
      { name: "screens", type: "{ id, content }[]", description: "All screens; they stay mounted." },
      { name: "active", type: "string", description: "Id of the visible screen." },
      { name: "transition", type: '"fade" | "slide" | "none"', default: '"fade"', description: "Instant under reduced motion." },
    ] },
    { name: "Helpers", props: [
      { name: "deviceViewports", type: "Record<DeviceKind, { width, height }>", description: "Default screen sizes." },
      { name: "deviceFrameSize(device, viewport?)", type: "{ width, height }", description: "Outer frame size at scale 1." },
    ] },
  ],
  notes: [
    "The box reserves its aspect ratio in CSS, so the server render does not shift; the scale is applied once the width is measured.",
    "A static frame is a picture: write label like an image alt (what the screen says), and keep the real information in the page text.",
    "Scaling is a transform: text inside a strongly scaled frame gets small. Keep the important words outside the frame.",
  ],
  covers: [],
};

export default entry;
