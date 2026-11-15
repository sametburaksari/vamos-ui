import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import { DownloadKit, createZip, type DownloadAsset } from "./download-kit";
import { crc32 } from "./_zip";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const assets: DownloadAsset[] = [
  { id: "logo", name: "Logo, light background", file: "logo.svg", href: "/kit/logo.svg", size: 4_200, format: "SVG" },
  { id: "facts", name: "Fact sheet", file: "facts.txt", data: () => "Founded 2019", format: "TXT", size: 1_000 },
  { id: "shot", name: "Screenshot", file: "shot.jpg", href: "/kit/shot.jpg", size: 1_200_000, format: "JPG" },
];

async function readZip(blob: Blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(buf.buffer);
  const end = buf.length - 22;
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const len = view.getUint16(at + 28, true);
    names.push(new TextDecoder().decode(buf.slice(at + 46, at + 46 + len)));
    at += 46 + len;
  }
  return { signature: view.getUint32(0, true), names };
}

describe("createZip", () => {
  it("writes a stored archive with UTF-8 names and CRC-32", async () => {
    expect(crc32(new TextEncoder().encode("hello"))).toBe(0x3610a686);
    const blob = createZip([
      { name: "kit/a.txt", data: new TextEncoder().encode("hello") },
      { name: "kit/çay.txt", data: new Uint8Array([1, 2, 3]) },
    ]);
    expect(blob.type).toBe("application/zip");
    const { signature, names } = await readZip(blob);
    expect(signature).toBe(0x04034b50);
    expect(names).toEqual(["kit/a.txt", "kit/çay.txt"]);
  });
});

describe("DownloadKit", () => {
  let saved: Blob[] = [];
  beforeEach(() => {
    saved = [];
    URL.createObjectURL = vi.fn((b: Blob) => {
      saved.push(b);
      return "blob:test";
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("lists files with formats and sizes; plain links for hosted files", async () => {
    const { container } = renderWithProviders(<DownloadKit assets={assets} />);
    expect(screen.getByText("SVG · 4.2 kB")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Download Logo, light background" });
    expect(link).toHaveAttribute("href", "/kit/logo.svg");
    expect(link).toHaveAttribute("download", "logo.svg");
    expect(screen.getByRole("button", { name: "Download Fact sheet" })).toBeInTheDocument();
    expect(screen.getByText(/3 of 3 selected/)).toHaveTextContent("1.2 MB in total");
    await expectNoA11yViolations(container);
  });

  it("selects files and builds one ZIP, listing files that could not be fetched", async () => {
    globalThis.fetch = vi.fn(async (url: string) =>
      url.endsWith("logo.svg") ? new Response("<svg/>", { headers: { "content-type": "image/svg+xml" } }) : new Response("", { status: 404 }),
    ) as unknown as typeof fetch;
    const onDownload = vi.fn();
    const { user } = renderWithProviders(<DownloadKit assets={assets} archiveName="press-kit" onDownload={onDownload} />);
    await user.click(screen.getByRole("checkbox", { name: "Select all" }));
    expect(screen.getByRole("button", { name: "Download as ZIP" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "Select all" }));
    await user.click(screen.getByRole("button", { name: "Download 3 files as ZIP" }));
    await waitFor(() => expect(onDownload).toHaveBeenCalled());
    expect(onDownload.mock.calls[0]![0]).toMatchObject({ ids: ["logo", "facts", "shot"], file: "press-kit.zip", kind: "zip" });
    const { names } = await readZip(saved[0]!);
    expect(names).toEqual(["press-kit/logo.svg", "press-kit/facts.txt", "press-kit/MISSING.txt"]);
    expect(screen.getByRole("status")).toHaveTextContent("Saved press-kit.zip without 1 file that could not be fetched");
  });

  it("downloads a generated file on its own and can be list-only", async () => {
    const { user, rerender } = renderWithProviders(<DownloadKit assets={assets} />);
    await user.click(screen.getByRole("button", { name: "Download Fact sheet" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/Saved facts.txt/));
    expect(await saved[0]!.text()).toBe("Founded 2019");
    rerender(<DownloadKit assets={assets} selectable={false} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("toggles one row from the keyboard", async () => {
    const onSelectedChange = vi.fn();
    const { user } = renderWithProviders(<DownloadKit assets={assets} defaultSelected={[]} onSelectedChange={onSelectedChange} />);
    screen.getByRole("checkbox", { name: "Select Screenshot" }).focus();
    await user.keyboard(" ");
    expect(onSelectedChange).toHaveBeenCalledWith(["shot"]);
    expect(screen.getByRole("checkbox", { name: "Select all" })).toHaveAttribute("aria-checked", "mixed");
  });
});
