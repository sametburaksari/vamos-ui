import * as React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./input";
import { FileUpload, ImageUpload, matchesAccept, parseAccept, type UploadFile, type UploadHandler } from "./file-upload";

const pdf = (name = "Offer letter.pdf", size = 240_000) => new File([new Uint8Array(size)], name, { type: "application/pdf" });

describe("accept helpers", () => {
  it("matches extensions, exact types and wildcards", () => {
    const tokens = parseAccept("image/*, .PDF");
    expect(matchesAccept({ name: "a.pdf", type: "" }, tokens)).toBe(true);
    expect(matchesAccept({ name: "a.png", type: "image/png" }, tokens)).toBe(true);
    expect(matchesAccept({ name: "a.mov", type: "video/quicktime" }, tokens)).toBe(false);
  });
});

describe("FileUpload", () => {
  it("is a labelled button that opens the picker, lists files and shows the hint", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Contract documents">
        <FileUpload accept=".pdf" maxSize={10_000_000} onValueChange={onValueChange} />
      </Field>,
    );
    const button = screen.getByRole("button", { name: /Contract documents/ });
    expect(button).toHaveAccessibleDescription("PDF · up to 10 MB");
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const click = vi.spyOn(input, "click");
    button.focus();
    await user.keyboard("{Enter}");
    expect(click).toHaveBeenCalled();
    await user.upload(input, pdf("Contrat signé.pdf".normalize("NFD")));
    expect(screen.getByText("Contrat signé.pdf")).toBeInTheDocument();
    expect(screen.getByText("Ready to send")).toBeInTheDocument();
    expect(onValueChange.mock.calls.at(-1)![0][0]).toMatchObject({ name: "Contrat signé.pdf", status: "done" });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("rejects by type, size and count with localized messages", async () => {
    const onReject = vi.fn();
    const { container } = render(<FileUpload aria-label="Attachments" accept="image/*,.pdf" maxSize={1000} maxFiles={1} onReject={onReject} />);
    const zone = container.querySelector('[data-slot="file-upload-dropzone"]')!;
    const files = [new File(["x"], "promo.mov", { type: "video/quicktime" }), pdf("big.pdf", 5000), pdf("ok.pdf", 10), pdf("second.pdf", 10)];
    fireEvent.drop(zone, { dataTransfer: { files, types: ["Files"] } });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("promo.mov: this file type isn't supported (only Images or PDF)");
    expect(alert).toHaveTextContent("big.pdf is larger than 1 kB");
    expect(alert).toHaveTextContent("second.pdf wasn't added: you can add 1 file");
    expect(onReject.mock.calls[0]![0].map((r: { reason: string }) => r.reason)).toEqual(["type", "size", "count"]);
    expect(screen.getByText("ok.pdf")).toBeInTheDocument();
  });

  it("uploads with progress, announces results, retries failures and removes files", async () => {
    const user = userEvent.setup();
    let fail = true;
    const resolvers: Array<() => void> = [];
    const upload: UploadHandler = (file, { onProgress }) =>
      new Promise((resolve, reject) => {
        onProgress(40);
        resolvers.push(() => (fail && file.name === "broken.pdf" ? reject(new Error("Server rejected the file")) : resolve({ id: `id-${file.name}` })));
      });
    function Demo() {
      const [files, setFiles] = React.useState<UploadFile[]>([]);
      return <FileUpload aria-label="Docs" upload={upload} value={files} onValueChange={setFiles} />;
    }
    const { container } = render(<Demo />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, [pdf("payslip.pdf"), pdf("broken.pdf")]);
    expect(screen.getAllByRole("progressbar")).toHaveLength(2);
    expect(screen.getAllByText("Uploading 40%")).toHaveLength(2);
    await act(async () => resolvers.splice(0).forEach((r) => r()));
    expect(await screen.findByText("Server rejected the file")).toBeInTheDocument();
    expect(screen.getByText("Uploaded")).toBeInTheDocument();
    expect(screen.getByText("broken.pdf failed to upload")).toBeInTheDocument();
    fail = false;
    await user.click(screen.getByRole("button", { name: "Retry broken.pdf" }));
    await waitFor(() => expect(resolvers.length).toBe(1));
    await act(async () => resolvers.splice(0).forEach((r) => r()));
    await waitFor(() => expect(screen.getAllByText("Uploaded")).toHaveLength(2));
    await user.click(screen.getByRole("button", { name: "Remove payslip.pdf" }));
    expect(screen.queryByText("payslip.pdf")).toBeNull();
  });

  it("shows existing server files and the button variant", () => {
    const { container } = render(
      <FileUpload
        variant="button"
        aria-label="Attachments"
        defaultValue={[{ key: "s1", name: "Q3 proposal.pdf", size: 1_240_000, type: "application/pdf", status: "done", url: "/files/q3.pdf" }]}
      />,
    );
    expect(screen.getByRole("button", { name: /Choose files/ })).toBeInTheDocument();
    expect(screen.getByText("Q3 proposal.pdf")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="file-upload-item"]')).toHaveAttribute("data-status", "done");
  });
});

describe("ImageUpload", () => {
  it("shows a preview with Replace and Remove", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Cover image">
        <ImageUpload defaultValue={{ key: "c", name: "harbour.jpg", size: 320_000, type: "image/jpeg", status: "done", url: "/img/harbour.jpg" }} onValueChange={onValueChange} />
      </Field>,
    );
    expect(screen.getByRole("img", { name: "Preview of harbour.jpg" })).toHaveAttribute("src", "/img/harbour.jpg");
    await user.click(screen.getByRole("button", { name: "Remove image" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("button", { name: /Cover image/ })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
