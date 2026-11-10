import * as React from "react";
import { act, screen, waitFor } from "@testing-library/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  ConfirmProvider,
  useConfirm,
  type ConfirmOptions,
} from "./alert-dialog";
import { Button } from "./button";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function DeletePost({ tone = "danger", onAction }: { tone?: "danger" | "default"; onAction?: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Delete post</Button>
      </AlertDialogTrigger>
      <AlertDialogContent tone={tone}>
        <AlertDialogHeader title="Delete this post permanently?" description="It can't be restored from the trash." />
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction onClick={onAction}>Delete post</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConfirmHarness({ options, onResult }: { options: ConfirmOptions; onResult: (v: boolean) => void }) {
  const confirm = useConfirm();
  return <Button onClick={async () => onResult(await confirm(options))}>Run</Button>;
}

describe("AlertDialog", () => {
  it("is an alertdialog with focus on Cancel for danger, and passes axe", async () => {
    const { user } = renderWithProviders(<DeletePost />);
    await user.click(screen.getByRole("button", { name: "Delete post" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Delete this post permanently?" });
    expect(dialog).toHaveAccessibleDescription("It can't be restored from the trash.");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await expectNoA11yViolations();
  });

  it("focuses the action for tone=default and runs it", async () => {
    const onAction = vi.fn();
    const { user } = renderWithProviders(<DeletePost tone="default" onAction={onAction} />);
    await user.click(screen.getByRole("button", { name: "Delete post" }));
    await screen.findByRole("alertdialog");
    const action = screen.getAllByRole("button", { name: "Delete post" }).find((b) => b.dataset.slot === "alert-dialog-action")!;
    await waitFor(() => expect(action).toHaveFocus());
    await user.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("Escape cancels", async () => {
    const { user } = renderWithProviders(<DeletePost />);
    await user.click(screen.getByRole("button", { name: "Delete post" }));
    await screen.findByRole("alertdialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});

describe("useConfirm", () => {
  it("resolves true on confirm and false on cancel", async () => {
    const onResult = vi.fn();
    const { user } = renderWithProviders(
      <ConfirmProvider>
        <ConfirmHarness options={{ title: "Close deal as lost?", confirmLabel: "Close deal" }} onResult={onResult} />
      </ConfirmProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Run" }));
    await user.click(await screen.findByRole("button", { name: "Close deal" }));
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));
    await user.click(screen.getByRole("button", { name: "Run" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(false));
  });

  it("requireText unlocks the action, compared with locale rules (Turkish İ/ı)", async () => {
    const onResult = vi.fn();
    const { user } = renderWithProviders(
      <ConfirmProvider>
        <ConfirmHarness options={{ title: "Delete site?", tone: "danger", requireText: "İzmir-blog", confirmLabel: "Delete site" }} onResult={onResult} />
      </ConfirmProvider>,
      { locale: "tr-TR" },
    );
    await user.click(screen.getByRole("button", { name: "Run" }));
    const action = await screen.findByRole("button", { name: "Delete site" });
    expect(action).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "izmir-blog");
    expect(action).toBeEnabled();
    await expectNoA11yViolations();
    await user.click(action);
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
  });

  it("keeps the dialog open and shows the error when onConfirm throws", async () => {
    const onResult = vi.fn();
    let reject!: (e: Error) => void;
    const onConfirm = () => new Promise<void>((_, r) => (reject = r));
    const { user } = renderWithProviders(
      <ConfirmProvider>
        <ConfirmHarness options={{ title: "End partner agreement?", onConfirm, confirmLabel: "End agreement" }} onResult={onResult} />
      </ConfirmProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Run" }));
    const action = await screen.findByRole("button", { name: "End agreement" });
    await user.click(action);
    expect(action).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await act(async () => reject(new Error("The partner portal is offline.")));
    expect(await screen.findByRole("alert")).toHaveTextContent("The partner portal is offline.");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(onResult).not.toHaveBeenCalled();
  });

  it("throws a helpful error without a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderWithProviders(<ConfirmHarness options={{ title: "x" }} onResult={() => {}} />)).toThrow(/ConfirmProvider/);
    spy.mockRestore();
  });
});
