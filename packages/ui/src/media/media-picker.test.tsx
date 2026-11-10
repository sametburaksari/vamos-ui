import * as React from "react";
import { screen, waitFor, within } from "@testing-library/react";
import { MediaPicker, MediaPickerProvider, useMediaPicker } from "./media-picker";
import { createMemoryAdapter } from "./memory-adapter";
import { mediaFolders, mediaSeed } from "./test-fixtures";
import type { MediaAsset } from "./types";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const adapter = () => createMemoryAdapter({ seed: mediaSeed, folders: mediaFolders, latency: 0, uploadDuration: 10 });

describe("MediaPicker", () => {
  it("opens from its trigger, focuses search, filters by accept and passes axe", async () => {
    const { user } = renderWithProviders(
      <MediaPicker adapter={adapter()} accept="image/*" size="md">
        <button type="button">Choose image</button>
      </MediaPicker>,
    );
    await user.click(screen.getByRole("button", { name: "Choose image" }));
    const dialog = await screen.findByRole("dialog", { name: "Select image" });
    await waitFor(() => expect(within(dialog).getAllByRole("gridcell")).toHaveLength(4));
    expect(within(dialog).getByRole("searchbox", { name: "Search files" })).toHaveFocus();
    expect(within(dialog).getByRole("tab", { name: "Library" })).toHaveAttribute("aria-selected", "true");
    expect(within(dialog).getByRole("button", { name: "Insert" })).toBeDisabled();
    await expectNoA11yViolations();
  });

  it("selects several files, pluralises the confirm button and confirms with Ctrl+Enter", async () => {
    const onSelect = vi.fn();
    const { user } = renderWithProviders(<MediaPicker adapter={adapter()} accept="image/*" multiple max={3} defaultOpen size="md" onSelect={onSelect} />);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getAllByRole("gridcell").length).toBeGreaterThan(1));
    const cells = within(dialog).getAllByRole("gridcell");
    await user.click(cells[0]!);
    await user.click(cells[2]!);
    expect(within(dialog).getByRole("button", { name: "Insert 2 images" })).toBeEnabled();
    expect(within(dialog).getByText("2 files selected")).toHaveAttribute("aria-live", "polite");
    await user.keyboard("{Control>}{Enter}{/Control}");
    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    expect((onSelect.mock.calls[0]![0] as MediaAsset[]).map((a) => a.id)).toHaveLength(2);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("asks for missing alt text with requireAlt and saves it on confirm", async () => {
    const a = adapter();
    const update = vi.spyOn(a, "update");
    const onSelect = vi.fn();
    const { user } = renderWithProviders(<MediaPicker adapter={a} accept="image/*" requireAlt defaultOpen size="md" onSelect={onSelect} />);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getAllByRole("gridcell").length).toBeGreaterThan(0));
    await user.click(within(dialog).getByRole("gridcell", { name: /^team-offsite\.jpg/ }));
    expect(within(dialog).getByText("An image needs alt text")).toBeInTheDocument();
    const confirm = within(dialog).getByRole("button", { name: "Insert image" });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByRole("textbox", { name: "Alt text for team-offsite.jpg" }), "Team lunch on the terrace");
    await user.click(confirm);
    await waitFor(() => expect(update).toHaveBeenCalledWith("m2", { alt: "Team lunch on the terrace" }));
    await waitFor(() => expect(onSelect.mock.calls[0]![0][0]).toMatchObject({ id: "m2", alt: "Team lunch on the terrace" }));
  });

  it("resolves useMediaPicker() with [] when cancelled", async () => {
    let result: MediaAsset[] | undefined;
    function Opener() {
      const pick = useMediaPicker();
      return (
        <button type="button" onClick={async () => (result = await pick({ accept: "image/*", size: "md" }))}>
          Pick logo
        </button>
      );
    }
    const { user } = renderWithProviders(
      <MediaPickerProvider adapter={adapter()}>
        <Opener />
      </MediaPickerProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Pick logo" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(result).toEqual([]));
  });
});
