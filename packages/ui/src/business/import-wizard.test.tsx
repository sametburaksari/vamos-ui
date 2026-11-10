import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ImportWizard } from "./import-wizard";
import { autoMap, parseCell, parseDateCell, sniffCsv, validateImport, type ImportField } from "./import-core";

const fields: ImportField[] = [
  { id: "name", label: "Full name", aliases: ["Ad Soyad", "Name"], required: true, type: "text" },
  { id: "email", label: "Email", aliases: ["E-posta", "Mail"], required: true, type: "email" },
  { id: "city", label: "City", aliases: ["Şehir"], type: "text" },
  { id: "value", label: "Deal value", aliases: ["Tutar"], type: "money" },
];

describe("import core", () => {
  it("sniffs Windows-1254 semicolon files and BOMs", () => {
    // "Şehir;Ad\r\n" in Windows-1254: Ş = 0xDE
    const bytes = new Uint8Array([0xde, 0x65, 0x68, 0x69, 0x72, 0x3b, 0x41, 0x64, 0x0d, 0x0a, 0x49, 0x73, 0x74, 0x3b, 0x41, 0x0d, 0x0a]);
    expect(sniffCsv(bytes)).toMatchObject({ encoding: "windows-1254", delimiter: ";", hasBom: false });
    expect(sniffCsv(new Uint8Array([0xef, 0xbb, 0xbf, 0x61, 0x2c, 0x62]))).toMatchObject({ encoding: "utf-8", hasBom: true, delimiter: "," });
  });
  it("auto-maps with Turkish folding", () => {
    expect(autoMap(["AD SOYAD", "e-posta", "ŞEHİR", "Notes"], fields, "tr-TR")).toEqual({ 0: "name", 1: "email", 2: "city", 3: null });
  });
  it("parses cells with the file's locale", () => {
    expect(parseCell("1.234,50", fields[3]!, "tr-TR").value).toBe("1234.50");
    expect(parseDateCell("10.11.2026", "tr-TR")).toBe("2026-11-10");
    expect(parseDateCell("11/10/2026", "en-US")).toBe("2026-11-10");
    expect(parseDateCell("46336")).toBe("2026-11-10");
    expect(parseCell("not-an-email", fields[1]!).error).toBe("Not an email address");
  });
  it("validates rows and flags duplicates", () => {
    const res = validateImport([["Ayşe", "ayse@x.com"], ["", "bad"], ["Ayşe Y.", "AYSE@x.com"]], { 0: "name", 1: "email" }, fields, { dedupeKeys: ["email"] });
    expect(res[1]!.errors).toEqual({ name: "Required", email: "Not an email address" });
    expect(res[2]!.warnings.email).toBe("Duplicate of row 1");
  });
});

const csv = "Name,E-posta,City,Tutar\nAyşe Yılmaz,ayse@northwind.com,İstanbul,1250.00\nMert Kaya,mert@,Ankara,980\nElif Şahin,elif@contoso.com,İzmir,3400.5\n";

describe("ImportWizard", () => {
  it("has no a11y violations on the upload step", async () => {
    const { container } = render(<ImportWizard fields={fields} onImport={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 2, name: /Upload/ })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("runs upload → map → review (inline fix) → import → report", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn(async (rows: Record<string, unknown>[]) => ({ ok: rows.length - 1, failed: [{ row: 0, error: "Email already belongs to another contact" }] }));
    render(<ImportWizard fields={fields} dedupeKeys={["email"]} onImport={onImport} />);

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, new File([csv], "contacts.csv", { type: "text/csv" }));
    expect(await screen.findByText(/3 rows · 4 columns/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Mapping: auto-mapped, labelled selects
    expect(await screen.findByRole("heading", { level: 2, name: /Map columns/ })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Column “E-posta” maps to" })).toHaveTextContent("Email");
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Review: one error, fix inline
    expect(await screen.findByText(/3 rows · 1 errors · 0 warnings/)).toBeInTheDocument();
    const bad = screen.getByRole("textbox", { name: "Email, row 2" });
    fireEvent.keyDown(bad, { key: "F8" });
    await waitFor(() => expect(bad).toHaveFocus());
    await user.clear(bad);
    await user.type(bad, "mert@fabrikam.com");
    fireEvent.blur(bad);
    expect(await screen.findByText(/3 rows · 0 errors/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Import + report
    await user.click(await screen.findByRole("button", { name: /Import 3 rows/ }));
    expect(await screen.findByRole("heading", { name: "Import finished with problems" })).toBeInTheDocument();
    expect(onImport).toHaveBeenCalledTimes(1);
    expect(onImport.mock.calls[0]![0][1]).toMatchObject({ email: "mert@fabrikam.com", value: "980" });
    expect(screen.getByText("2 imported · 1 failed · 0 skipped")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download failed rows/ })).toBeInTheDocument();
  });

  it("blocks the mapping step while a required field is unmapped", async () => {
    const user = userEvent.setup();
    render(<ImportWizard fields={fields} onImport={vi.fn()} />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, new File(["Company,Phone\nNorthwind,+90 532 000 00 00\n"], "c.csv", { type: "text/csv" }));
    await screen.findByText(/1 rows · 2 columns/);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(await screen.findByRole("button", { name: "Next" }));
    expect(await screen.findByText("Map the required fields: Full name and Email")).toBeInTheDocument();
  });
});
