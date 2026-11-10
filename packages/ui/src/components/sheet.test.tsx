import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTrigger, Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "./sheet";
import { Button } from "./button";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("Sheet", () => {
  it("opens from the end as a modal dialog and passes axe", async () => {
    const { user } = renderWithProviders(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Quick edit</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader title="Edit contact" description="Changes save to the CRM." />
          <SheetBody>
            <input aria-label="Email" defaultValue="elif@modawellness.com" />
          </SheetBody>
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByRole("button", { name: "Quick edit" });
    await user.click(trigger);
    const sheet = await screen.findByRole("dialog", { name: "Edit contact" });
    expect(sheet).toHaveAttribute("data-side", "end");
    expect(sheet).toHaveClass("ui-sheet-end");
    await expectNoA11yViolations();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("maps left/right aliases to logical sides and sets size/inset", async () => {
    renderWithProviders(
      <Sheet defaultOpen>
        <SheetContent side="left" size="lg" inset>
          <SheetHeader title="Navigation" />
        </SheetContent>
      </Sheet>,
    );
    const sheet = await screen.findByRole("dialog");
    expect(sheet).toHaveAttribute("data-side", "start");
    expect(sheet).toHaveAttribute("data-size", "lg");
    expect(sheet).toHaveAttribute("data-inset");
  });

  it("modal={false}: no overlay, outside clicks keep it open, Escape still closes", async () => {
    const { user } = renderWithProviders(
      <>
        <button>Next row</button>
        <Sheet defaultOpen modal={false}>
          <SheetContent>
            <SheetHeader title="Kadıköy Bistro" />
            <SheetBody>Deal value $1,280 / mo</SheetBody>
          </SheetContent>
        </Sheet>
      </>,
    );
    const sheet = await screen.findByRole("dialog");
    expect(sheet).toHaveAttribute("aria-modal", "false");
    expect(document.querySelector("[data-slot=dialog-overlay]")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Next row" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    sheet.focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("Drawer", () => {
  function Filters() {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Filters</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader title="Filter orders" />
          <DrawerBody>
            <label>
              <input type="checkbox" /> Unpaid only
            </label>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  it("is a bottom sheet with a decorative handle and passes axe", async () => {
    const { user } = renderWithProviders(<Filters />);
    await user.click(screen.getByRole("button", { name: "Filters" }));
    const drawer = await screen.findByRole("dialog", { name: "Filter orders" });
    expect(drawer).toHaveAttribute("data-side", "bottom");
    expect(drawer.querySelector("[data-slot=drawer-handle]")).toHaveAttribute("aria-hidden", "true");
    await expectNoA11yViolations();
  });

  it("closes after dragging down past the threshold", async () => {
    const { user } = renderWithProviders(<Filters />);
    await user.click(screen.getByRole("button", { name: "Filters" }));
    const drawer = await screen.findByRole("dialog");
    vi.spyOn(drawer, "getBoundingClientRect").mockReturnValue({ height: 400 } as DOMRect);
    const handle = drawer.querySelector("[data-slot=drawer-handle]")!;
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1, button: 0, pointerType: "touch" });
    fireEvent.pointerMove(handle, { clientY: 180, pointerId: 1, pointerType: "touch" });
    expect(drawer).toHaveAttribute("data-dragging");
    expect(drawer.style.translate).toBe("0px 80px");
    fireEvent.pointerMove(handle, { clientY: 300, pointerId: 1, pointerType: "touch" });
    fireEvent.pointerUp(handle, { clientY: 300, pointerId: 1, pointerType: "touch" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("springs back on a short drag and never starts on a control", async () => {
    const { user } = renderWithProviders(<Filters />);
    await user.click(screen.getByRole("button", { name: "Filters" }));
    const drawer = await screen.findByRole("dialog");
    vi.spyOn(drawer, "getBoundingClientRect").mockReturnValue({ height: 400 } as DOMRect);
    const handle = drawer.querySelector("[data-slot=drawer-handle]")!;
    // A slow 30px drag: under the distance threshold and the flick speed.
    const now = vi.spyOn(performance, "now").mockReturnValue(0);
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 2, pointerType: "touch" });
    fireEvent.pointerMove(handle, { clientY: 130, pointerId: 2, pointerType: "touch" });
    now.mockReturnValue(2000);
    fireEvent.pointerUp(handle, { clientY: 130, pointerId: 2, pointerType: "touch" });
    now.mockRestore();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(drawer.style.translate).toBe("");

    const checkbox = screen.getByRole("checkbox");
    fireEvent.pointerDown(checkbox, { clientY: 100, pointerId: 3, pointerType: "touch" });
    fireEvent.pointerMove(checkbox, { clientY: 300, pointerId: 3, pointerType: "touch" });
    expect(drawer).not.toHaveAttribute("data-dragging");
  });
});
