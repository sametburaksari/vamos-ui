import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function NewContact(props: Partial<React.ComponentProps<typeof DialogContent>> & { onOpenChange?: (o: boolean) => void }) {
  const { onOpenChange, ...content } = props;
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>New contact</Button>
      </DialogTrigger>
      <DialogContent {...content}>
        <DialogHeader title="New contact" description="Add a contact manually." />
        <DialogBody>
          <label>
            Full name
            <input name="name" />
          </label>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <Button variant="primary">Save contact</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens as a labelled, described modal dialog and passes axe", async () => {
    const { user } = renderWithProviders(<NewContact />);
    await user.click(screen.getByRole("button", { name: "New contact" }));
    const dialog = await screen.findByRole("dialog", { name: "New contact" });
    expect(dialog).toHaveAccessibleDescription("Add a contact manually.");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("data-size", "md");
    expect(dialog).toHaveAttribute("data-mobile", "sheet");
    expect(dialog).toHaveAttribute("data-layer-depth", "1");
    expect(document.querySelector("[data-slot=dialog-overlay]")).toHaveAttribute("data-overlay-blurred");
    await expectNoA11yViolations();
  });

  it("focuses the first field, closes on Escape and returns focus", async () => {
    const { user } = renderWithProviders(<NewContact />);
    const trigger = screen.getByRole("button", { name: "New contact" });
    await user.click(trigger);
    await screen.findByRole("dialog");
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("has a localized close button and drops aria-describedby without a description", async () => {
    const { user } = renderWithProviders(
      <Dialog defaultOpen>
        <DialogContent size="sm">
          <DialogHeader title="Insert link" />
          <DialogBody>Paste a URL</DialogBody>
        </DialogContent>
      </Dialog>,
      { messages: { dialog: { close: "Kapat" } } },
    );
    const dialog = await screen.findByRole("dialog", { name: "Insert link" });
    expect(dialog).not.toHaveAttribute("aria-describedby");
    await user.click(screen.getByRole("button", { name: "Kapat" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("dismissible={false} ignores Escape", async () => {
    const { user } = renderWithProviders(<NewContact dismissible={false} />);
    await user.click(screen.getByRole("button", { name: "New contact" }));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("onBeforeClose can keep it open, sync or async", async () => {
    let allow = false;
    const guard = vi.fn(async () => allow);
    const { user } = renderWithProviders(<NewContact onBeforeClose={guard} />);
    await user.click(screen.getByRole("button", { name: "New contact" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(guard).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    allow = true;
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("moves initial focus to [data-autofocus]", async () => {
    renderWithProviders(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader title="Invite partner" />
          <DialogBody>
            <input aria-label="Company" />
            <input aria-label="Email" data-autofocus />
          </DialogBody>
        </DialogContent>
      </Dialog>,
    );
    await screen.findByRole("dialog");
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Email" })).toHaveFocus());
  });

  it("supports srOnly titles and hideClose", async () => {
    renderWithProviders(
      <Dialog defaultOpen>
        <DialogContent hideClose size="lg" mobile="fullscreen">
          <DialogHeader title="Media preview" srOnly />
          <DialogBody>Image</DialogBody>
        </DialogContent>
      </Dialog>,
    );
    const dialog = await screen.findByRole("dialog", { name: "Media preview" });
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    expect(dialog).toHaveAttribute("data-mobile", "fullscreen");
    await expectNoA11yViolations();
  });
});
