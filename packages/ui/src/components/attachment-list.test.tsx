import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { LocaleProvider } from "../lib/locale";
import { AttachmentList, attachmentKind, splitFileName, type AttachmentData } from "./attachment-list";

const files: AttachmentData[] = [
  { id: "1", name: "Master services agreement.pdf", size: 1_240_000, mime: "application/pdf", url: "/files/msa.pdf", uploadedBy: "Ayşe Kaya", uploadedAt: "2026-11-04" },
  { id: "2", name: "Q4 pipeline.xlsx", size: 86_400, mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", url: "/files/q4.xlsx" },
  { id: "3", name: "site-photo.jpg", size: 3_200_000, mime: "image/jpeg", status: "uploading", progress: 45 },
  { id: "4", name: "scan.tiff", size: 9_800_000, mime: "image/tiff", status: "error", error: "File is larger than 8 MB" },
];

describe("AttachmentList", () => {
  it("detects file families and keeps extensions", () => {
    expect(attachmentKind("application/pdf", "a.pdf")).toBe("pdf");
    expect(attachmentKind("", "budget.xlsx")).toBe("spreadsheet");
    expect(attachmentKind("image/png", "x.png")).toBe("image");
    expect(splitFileName("contract.final.pdf")).toEqual(["contract.final", ".pdf"]);
    expect(splitFileName("README")).toEqual(["README", ""]);
  });

  it("renders a labelled list with sizes, meta, progress and errors (a11y)", async () => {
    const { container } = render(<AttachmentList items={files} onPreview={() => {}} onRemove={() => {}} onRetry={() => {}} />);
    expect(screen.getByRole("list", { name: "Attachments" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText(/1\.2 MB · Ayşe Kaya · Nov 4, 2026/)).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", { name: "site-photo.jpg" });
    expect(bar).toHaveAttribute("aria-valuetext", "45%, site-photo.jpg");
    expect(screen.getByText("File is larger than 8 MB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry scan.tiff" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("previews by name, downloads by link, removes optimistically", async () => {
    const user = userEvent.setup();
    const onPreview = vi.fn();
    let resolve!: () => void;
    const onRemove = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<AttachmentList items={files.slice(0, 2)} onPreview={onPreview} onRemove={onRemove} />);
    await user.click(screen.getAllByRole("button", { name: /Master services agreement/ })[0]!);
    expect(onPreview).toHaveBeenCalledWith(files[0]);
    expect(screen.getByRole("link", { name: "Download Master services agreement.pdf" })).toHaveAttribute("download", "Master services agreement.pdf");
    await user.click(screen.getByRole("button", { name: "Remove Q4 pipeline.xlsx" }));
    const row = screen.getAllByRole("listitem")[1]!;
    expect(row).toHaveAttribute("data-removing");
    resolve();
    await waitFor(() => expect(row).not.toHaveAttribute("data-removing"));
  });

  it("formats sizes for the locale, chips layout, empty and read-only", async () => {
    const { rerender, container } = render(
      <LocaleProvider locale="tr-TR">
        <AttachmentList layout="chips" readOnly items={files.slice(0, 1)} />
      </LocaleProvider>,
    );
    expect(screen.getByText("1,2 MB")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
    rerender(<AttachmentList items={[]} />);
    expect(screen.getByText("No files attached")).toBeInTheDocument();
  });

  it("adds files through the built-in chooser", async () => {
    const user = userEvent.setup();
    const onAddFiles = vi.fn();
    const { container } = render(<AttachmentList layout="grid" items={files.slice(0, 1)} onAddFiles={onAddFiles} />);
    expect(screen.getByRole("button", { name: "Add files" })).toBeInTheDocument();
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    await user.upload(input, new File(["x"], "brief.docx", { type: "application/msword" }));
    expect(onAddFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "brief.docx" })]);
  });
});
