import * as React from "react";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { MediaLibrary } from "./media-library";
import { createMemoryAdapter } from "./memory-adapter";
import { useUploadQueue } from "./use-upload-queue";
import { mediaFolders, mediaSeed } from "./test-fixtures";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const adapter = (o: Parameters<typeof createMemoryAdapter>[0] = {}) => createMemoryAdapter({ seed: mediaSeed, folders: mediaFolders, latency: 0, uploadDuration: 10, ...o });

async function tiles() {
  return waitFor(() => {
    const cells = screen.getAllByRole("gridcell");
    expect(cells.length).toBeGreaterThan(0);
    return cells;
  });
}

describe("MediaLibrary", () => {
  it("renders a grid with filters and passes axe", async () => {
    renderWithProviders(<MediaLibrary adapter={adapter()} />);
    const cells = await tiles();
    expect(cells).toHaveLength(5);
    expect(screen.getByRole("grid", { name: "Files" })).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("searchbox", { name: "Search files" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "File type" })).toBeInTheDocument();
    // missing alt text is flagged on the tile
    expect(screen.getByRole("gridcell", { name: /team-offsite\.jpg, Missing alt text/ })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("names a video tile with its visible duration and status (label in name)", async () => {
    const video = { ...mediaSeed[0]!, id: "v1", kind: "video" as const, mime: "video/mp4", filename: "launch-film.mp4", url: "https://cdn.example.com/launch-film.mp4", duration: 94, alt: "Launch film", status: "failed" as const };
    renderWithProviders(<MediaLibrary adapter={adapter({ seed: [video, ...mediaSeed] })} />);
    await tiles();
    const tile = screen.getByRole("gridcell", { name: /^launch-film\.mp4, 1m 34s, Failed$/ });
    expect(within(tile).getByText("1m 34s")).toHaveAttribute("aria-hidden");
    await expectNoA11yViolations(document.body, { "label-content-name-mismatch": { enabled: true } });
  });

  it("moves focus with arrows, selects with Space and Shift+arrow, selects all with Ctrl+A", async () => {
    const onSelectedChange = vi.fn();
    const { user } = renderWithProviders(<MediaLibrary adapter={adapter()} detailsPanel={false} onSelectedChange={onSelectedChange} />);
    const cells = await tiles();
    cells[0]!.focus();
    await user.keyboard(" ");
    expect(cells[0]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(document.activeElement).toBe(screen.getAllByRole("gridcell")[1]));
    expect(screen.getAllByRole("gridcell")[1]).toHaveAttribute("tabindex", "0");
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}");
    expect(screen.getAllByRole("gridcell")[2]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Control>}a{/Control}");
    expect(onSelectedChange.mock.lastCall?.[0]).toHaveLength(5);
    expect(screen.getByText("5 selected")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.getAllByRole("gridcell").every((c) => c.getAttribute("aria-selected") === "false")).toBe(true);
  });

  it("searches (locale-aware) and shows the no-results state with Clear filters", async () => {
    const { user } = renderWithProviders(<MediaLibrary adapter={adapter({ locale: "tr-TR" })} />, { locale: "tr-TR" });
    await tiles();
    await user.type(screen.getByRole("searchbox"), "KADIKÖY");
    await waitFor(() => expect(screen.getAllByRole("gridcell")).toHaveLength(1));
    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "zzzz");
    const clear = await screen.findByRole("button", { name: "Clear filters" });
    await user.click(clear);
    await waitFor(() => expect(screen.getAllByRole("gridcell")).toHaveLength(5));
  });

  it("opens the details panel with Enter and autosaves alt text", async () => {
    const a = adapter();
    const update = vi.spyOn(a, "update");
    const { user } = renderWithProviders(<MediaLibrary adapter={a} />);
    await tiles();
    screen.getByRole("gridcell", { name: /^team-offsite\.jpg/ }).focus();
    await user.keyboard("{Enter}");
    const panel = await screen.findByRole("complementary", { name: "File details" });
    const alt = within(panel).getByRole("textbox", { name: "Alt text" });
    await user.type(alt, "Team on the terrace in Moda");
    fireEvent.blur(alt);
    await waitFor(() => expect(update).toHaveBeenCalledWith("m2", expect.objectContaining({ alt: "Team on the terrace in Moda" })));
    await waitFor(() => expect(within(panel).getByText("Saved")).toBeInTheDocument());
  });

  it("asks before deleting with the Delete key", async () => {
    const a = adapter();
    const remove = vi.spyOn(a, "remove");
    const { user } = renderWithProviders(<MediaLibrary adapter={a} detailsPanel={false} />);
    await tiles();
    screen.getByRole("gridcell", { name: "q3-board-report.pdf" }).focus();
    await user.keyboard("{Delete}");
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith(["m5"], expect.anything()));
    await waitFor(() => expect(screen.getAllByRole("gridcell")).toHaveLength(4));
  });

  it("filters by accept and disables tiles past max", async () => {
    const { user } = renderWithProviders(<MediaLibrary adapter={adapter()} accept="image/*" max={1} detailsPanel={false} />);
    const cells = await tiles();
    expect(cells).toHaveLength(4);
    await user.click(cells[0]!);
    expect(screen.getAllByRole("gridcell")[1]).toHaveAttribute("aria-disabled", "true");
  });

  it("shows the list view as a table", async () => {
    renderWithProviders(<MediaLibrary adapter={adapter()} defaultView="list" />);
    const table = await screen.findByRole("table", { name: "Files" });
    await waitFor(() => expect(within(table).getAllByRole("row")).toHaveLength(6));
    expect(within(table).getByRole("checkbox", { name: "Select q3-board-report.pdf" })).toBeInTheDocument();
  });

  it("renders the empty state and an error with Retry", async () => {
    renderWithProviders(<MediaLibrary adapter={createMemoryAdapter({ latency: 0 })} />);
    expect(await screen.findByText("No files yet")).toBeInTheDocument();
    const broken = { ...adapter(), list: vi.fn().mockRejectedValue(new Error("offline")) };
    renderWithProviders(<MediaLibrary adapter={broken} />);
    expect(await screen.findByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});

describe("useUploadQueue", () => {
  it("uploads with progress, rejects wrong types and retries failures", async () => {
    const a = adapter();
    const onUploaded = vi.fn();
    const { result } = renderHook(() => useUploadQueue(a, { accept: "application/pdf", onUploaded }));
    // jsdom never decodes images, so the queue is exercised with a PDF.
    const good = new File(["x".repeat(100)], "dinner-menu.pdf", { type: "application/pdf" });
    const bad = new File(["x"], "notes.txt", { type: "text/plain" });
    act(() => result.current.add([good, bad]));
    expect(result.current.items[1]).toMatchObject({ status: "error", rejected: true });
    await waitFor(() => expect(result.current.items[0]!.status).toBe("done"));
    expect(onUploaded).toHaveBeenCalledWith(expect.objectContaining({ filename: "dinner-menu.pdf" }), expect.anything());
    expect(result.current.done).toBe(1);

    const failing = { ...a, upload: vi.fn().mockRejectedValueOnce(new Error("Server said no")).mockImplementation(a.upload) };
    const q = renderHook(() => useUploadQueue(failing));
    act(() => q.result.current.add([good]));
    await waitFor(() => expect(q.result.current.items[0]).toMatchObject({ status: "error", error: "Server said no" }));
    act(() => q.result.current.retry(q.result.current.items[0]!.id));
    await waitFor(() => expect(q.result.current.items[0]!.status).toBe("done"));
  });
});
