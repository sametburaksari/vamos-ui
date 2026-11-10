import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ExportDialog, type ExportRequest } from "./export";
import { exportFilename, exportToBlob, maskValue, type ExportColumn } from "./export-core";

const columns: ExportColumn[] = [
  { id: "name", label: "Name" },
  { id: "company", label: "Company" },
  { id: "email", label: "Email", personalData: true },
  { id: "phone", label: "Phone", personalData: true, maskByDefault: true },
  { id: "value", label: "Deal value", type: "number", defaultSelected: false },
];

const blobBytes = (b: Blob) => new Promise<Uint8Array>((res) => { const r = new FileReader(); r.onload = () => res(new Uint8Array(r.result as ArrayBuffer)); r.readAsArrayBuffer(b); });

describe("export core", () => {
  it("writes locale CSV with BOM, masking and a formula guard", async () => {
    const blob = await exportToBlob({
      rows: [{ name: "=HYPERLINK(\"x\")", email: "ayse@northwind.com", value: 1250.5 }],
      columns: [columns[0]!, columns[2]!, columns[4]!],
      format: "csv",
      masked: ["email"],
      locale: "tr-TR",
    });
    const bytes = await blobBytes(blob);
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("Name;Email;Deal value");
    expect(text).toContain("'=HYPERLINK");
    expect(text).toContain("a••••@northwind.com");
    expect(text).toContain("1250,5");
  });
  it("builds dated file names and masks values", () => {
    expect(exportFilename("Contacts list", "xlsx", "2026-11-10")).toBe("contacts-list-2026-11-10.xlsx");
    expect(maskValue("+90 532 111 22 33")).toBe("••••••••33");
  });
});

describe("ExportDialog", () => {
  it("opens from the trigger with scope, columns and format, without a11y violations", async () => {
    const user = userEvent.setup();
    render(<ExportDialog resource="contacts" columns={columns} selectedCount={3} filteredCount={248} totalCount={1240} trigger={<button>Export</button>} onExport={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Export" }));
    const dialog = await screen.findByRole("dialog", { name: "Export contacts" });
    expect(within(dialog).getByRole("radiogroup", { name: "Rows" })).toBeInTheDocument();
    expect(within(dialog).getByRole("radio", { name: /Selected rows/ })).toBeChecked();
    expect(within(dialog).getByRole("checkbox", { name: "Deal value" })).not.toBeChecked();
    expect(within(dialog).getByRole("radiogroup", { name: "Format" })).toBeInTheDocument();
    expect(await axe(dialog)).toHaveNoViolations();
  });

  it("asks for a reason when personal data leaves unmasked, then sends the request", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn(async (_r: ExportRequest) => ({ blob: new Blob(["x"]), filename: "contacts.csv" }));
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
    render(<ExportDialog resource="contacts" columns={columns} filteredCount={248} totalCount={1240} defaultOpen onExport={onExport} />);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("This export contains personal data")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /^Export/ }));
    expect(onExport).not.toHaveBeenCalled();
    expect(within(dialog).getByText("Add a reason to export personal data.")).toBeInTheDocument();
    await user.type(within(dialog).getByRole("textbox", { name: /Reason for export/ }), "Board deck churn analysis");
    await user.click(within(dialog).getByRole("button", { name: /^Export/ }));
    await waitFor(() => expect(onExport).toHaveBeenCalled());
    const req = onExport.mock.calls[0]![0];
    expect(req).toMatchObject({ scope: "filtered", columns: ["name", "company", "email", "phone"], masked: ["phone"], format: "csv", reason: "Board deck churn analysis" });
  });

  it("runs a background job and focuses the download link", async () => {
    const user = userEvent.setup();
    const pollJob = vi.fn().mockResolvedValue({ status: "done", url: "https://files.example.com/contacts.xlsx" });
    render(<ExportDialog resource="contacts" columns={columns.slice(0, 2)} totalCount={180000} defaultScope="all" defaultOpen onExport={async () => ({ jobId: "job_42" })} pollJob={pollJob} />);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/runs in the background/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /^Export/ }));
    expect((await within(dialog).findAllByText("Queued")).length).toBeGreaterThan(0);
    const link = await within(dialog).findByRole("link", { name: /Download contacts-/ }, { timeout: 3000 });
    await waitFor(() => expect(link).toHaveFocus());
  });
});
