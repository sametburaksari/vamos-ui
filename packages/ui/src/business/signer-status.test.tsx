import * as React from "react";
import { screen, within } from "@testing-library/react";
import { SignerStatus, type Signer } from "./signer-status";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const NOW = Date.parse("2026-11-18T10:24:00+03:00");
const signers: Signer[] = [
  { id: "a", name: "Elif Sarı", role: "Client", email: "elif@quillfeather.example.com", status: "signed", at: "2026-11-17T16:02:00+03:00" },
  { id: "b", name: "Tomás Herrera", role: "Account executive", status: "viewed", at: "2026-11-18T09:10:00+03:00" },
  { id: "c", name: "Defne Kaya", role: "Countersigner", status: "waiting" },
];

describe("SignerStatus", () => {
  it("summarises progress and lists each signer in order", async () => {
    const { container } = renderWithProviders(<SignerStatus signers={signers} sequential now={NOW} />);
    const region = screen.getByRole("region", { name: "Signatures" });
    expect(region).toHaveTextContent("1 of 3 signed");
    const rows = within(region).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("Signed");
    expect(rows[0]).toHaveTextContent("18 hours ago");
    expect(rows[1]).toHaveTextContent("Signs 2");
    expect(rows[2]).toHaveTextContent("Waiting");
    await expectNoA11yViolations(container);
  });

  it("reminds sent / viewed signers and confirms", async () => {
    const onRemind = vi.fn().mockResolvedValue(undefined);
    const { user } = renderWithProviders(<SignerStatus signers={signers} onRemind={onRemind} now={NOW} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Send a reminder to Tomás Herrera" }));
    expect(onRemind).toHaveBeenCalledWith(signers[1]);
    expect(await screen.findByText("Reminder sent")).toBeInTheDocument();
  });

  it("reports a decline and full completion", () => {
    const { rerender } = renderWithProviders(<SignerStatus signers={[signers[0]!, { ...signers[1]!, status: "declined", note: "Prices need a second look." }]} />);
    expect(screen.getByText("Declined by Tomás Herrera")).toBeInTheDocument();
    expect(screen.getByText("Prices need a second look.")).toBeInTheDocument();
    rerender(<SignerStatus signers={[signers[0]!]} />);
    expect(screen.getByText("Fully signed")).toBeInTheDocument();
  });
});
