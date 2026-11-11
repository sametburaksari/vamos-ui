import * as React from "react";
import { screen } from "@testing-library/react";
import { BackupCodes } from "./backup-codes";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const codes = ["4K7Q-PX2M", "9DTR-H3VA", "B6WN-82ZE", "JX5C-QM4T"];

describe("BackupCodes", () => {
  it("lists codes, marks used ones and counts what is left", async () => {
    const { container } = renderWithProviders(<BackupCodes codes={codes} used={["9DTR-H3VA"]} />);
    expect(screen.getByRole("group", { name: "Backup codes" })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[1]).toHaveAttribute("data-used");
    expect(items[1]).toHaveTextContent("(used)");
    expect(screen.getByText("3 of 4 left")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("copies all codes and announces it; download and regenerate call back", async () => {
    const onCopy = vi.fn();
    const onDownload = vi.fn();
    const onRegenerate = vi.fn();
    const { user } = renderWithProviders(<BackupCodes codes={codes} fileNote="Kiln & Linen — ada@example.com" onCopy={onCopy} onDownload={onDownload} onRegenerate={onRegenerate} />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    const text = onCopy.mock.calls[0]![0] as string;
    expect(text).toContain("Kiln & Linen — ada@example.com");
    expect(text).toContain(" 1. 4K7Q-PX2M");
    expect(screen.getByRole("status")).toHaveTextContent("Backup codes copied to the clipboard");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Download" }));
    expect(onDownload).toHaveBeenCalledWith(text);
    await user.click(screen.getByRole("button", { name: "New codes" }));
    expect(onRegenerate).toHaveBeenCalled();
  });

  it("uses Turkish labels from the labels prop", () => {
    renderWithProviders(<BackupCodes codes={codes} labels={{ title: "Yedek kodlar", remaining: "{total} koddan {left} kaldı" }} />, { locale: "tr-TR" });
    expect(screen.getByRole("group", { name: "Yedek kodlar" })).toBeInTheDocument();
    expect(screen.getByText("4 koddan 4 kaldı")).toBeInTheDocument();
  });
});
