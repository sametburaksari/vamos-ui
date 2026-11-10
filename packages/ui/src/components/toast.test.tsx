import * as React from "react";
import { act, screen, waitFor } from "@testing-library/react";
import { toast, Toaster } from "./toast";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

// jsdom lacks pointer capture, which the swipe-to-dismiss handler calls on pointerdown.
Element.prototype.setPointerCapture ??= () => {};

afterEach(() => {
  act(() => toast.dismiss());
});

describe("Toast", () => {
  it("renders a labelled live region and a toast with description", async () => {
    renderWithProviders(<Toaster />);
    act(() => {
      toast.success("Post published", { description: "“Winter menu at Kadıköy Bistro” is live." });
    });
    expect(await screen.findByText("Post published")).toBeInTheDocument();
    expect(screen.getByText(/Winter menu/)).toBeInTheDocument();
    const region = screen.getByRole("region", { name: /Notifications/ });
    expect(region.querySelector("[data-sonner-toast]")).toHaveClass("vui-toast", "tone-success");
    await expectNoA11yViolations();
  });

  it("runs the action (Undo) and returns a string id", async () => {
    const onUndo = vi.fn();
    const { user } = renderWithProviders(<Toaster />);
    let id = "";
    act(() => {
      id = toast("Contact moved to trash", { action: { label: "Undo", onClick: onUndo } });
    });
    expect(typeof id).toBe("string");
    await user.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("danger toasts are announced as alerts", async () => {
    renderWithProviders(<Toaster />);
    act(() => {
      toast.danger("Couldn't save the invoice");
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't save the invoice");
  });

  it("updates one toast in place by id (loading → success)", async () => {
    renderWithProviders(<Toaster />);
    let id = "";
    act(() => {
      id = toast.loading("Preparing export…");
    });
    expect(await screen.findByText("Preparing export…")).toBeInTheDocument();
    act(() => {
      toast.success("Export ready", { id });
    });
    expect(await screen.findByText("Export ready")).toBeInTheDocument();
    expect(screen.queryByText("Preparing export…")).toBeNull();
    expect(document.querySelectorAll("[data-sonner-toast]")).toHaveLength(1);
  });

  it("toast.promise resolves to success", async () => {
    renderWithProviders(<Toaster />);
    let resolve!: (v: { title: string }) => void;
    const p = new Promise<{ title: string }>((r) => (resolve = r));
    act(() => {
      void toast.promise(p, { loading: "Saving draft…", success: (d) => `Saved “${d.title}”`, error: "Couldn't save" });
    });
    expect(await screen.findByText("Saving draft…")).toBeInTheDocument();
    await act(async () => resolve({ title: "Q4 newsletter" }));
    await waitFor(() => expect(screen.getByText("Saved “Q4 newsletter”")).toBeInTheDocument());
  });

  it("renders only the first mounted Toaster", async () => {
    renderWithProviders(
      <>
        <Toaster />
        <Toaster />
      </>,
    );
    act(() => {
      toast.info("Leave approved");
    });
    await screen.findByText("Leave approved");
    expect(document.querySelectorAll("[data-sonner-toaster]")).toHaveLength(1);
  });
});
