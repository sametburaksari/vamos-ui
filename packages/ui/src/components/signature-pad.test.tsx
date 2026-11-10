import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./input";
import { SignaturePad, strokesToSvg, textToSvg, type SignatureValue } from "./signature-pad";

function draw(svg: Element, points: [number, number][]) {
  const [first, ...rest] = points;
  fireEvent.pointerDown(svg, { pointerId: 1, clientX: first![0], clientY: first![1], button: 0, pointerType: "mouse" });
  for (const [x, y] of rest) fireEvent.pointerMove(svg, { pointerId: 1, clientX: x, clientY: y, pointerType: "mouse" });
  fireEvent.pointerUp(svg, { pointerId: 1, clientX: rest.at(-1)![0], clientY: rest.at(-1)![1], pointerType: "mouse" });
}

describe("signature export", () => {
  it("produces standalone SVG with dark ink and escaped text", () => {
    expect(strokesToSvg([[[10, 10, 0.5], [40, 30, 0.5]]], 300, 120)).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 300 120".*fill="#14170f"><path d="M/);
    expect(textToSvg("Ayşe <Kaya>", 300, 120)).toContain("Ayşe &lt;Kaya&gt;");
  });
});

describe("SignaturePad", () => {
  it("draws strokes, undoes and clears", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Customer signature">
        <SignaturePad name="signature" onValueChange={onValueChange} />
      </Field>,
    );
    expect(screen.getByRole("group", { name: "Customer signature" })).toBeInTheDocument();
    const svg = container.querySelector('[data-slot="signature-pad-canvas"]')!;
    draw(svg, [[20, 80], [60, 60], [100, 90]]);
    draw(svg, [[120, 70], [160, 50]]);
    expect(svg.querySelectorAll("path")).toHaveLength(2);
    const last = onValueChange.mock.calls.at(-1)![0] as SignatureValue;
    expect(last.kind).toBe("drawn");
    expect(last.strokes).toHaveLength(2);
    expect(container.querySelector<HTMLInputElement>('input[name="signature"]')!.value).toBe(last.svg);
    expect(screen.getByText("Signature drawn, 2 strokes")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(svg.querySelectorAll("path")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /Clear/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByText("Sign here")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("offers a keyboard path: Type mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SignaturePad onValueChange={onValueChange} />);
    const draw = screen.getByRole("tab", { name: "Draw" });
    draw.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Type" })).toHaveAttribute("aria-selected", "true");
    await user.type(screen.getByRole("textbox", { name: "Full name" }), "Deniz Aydın");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ kind: "typed", text: "Deniz Aydın" }));
  });

  it("read-only shows the stored signature and its time", () => {
    const value: SignatureValue = { kind: "typed", text: "Elif Demir", svg: textToSvg("Elif Demir", 400, 160), signedAt: "2026-11-04T09:30:00Z" };
    render(<SignaturePad readOnly value={value} aria-label="Approval" />);
    expect(screen.getByRole("img", { name: "Signature: Elif Demir" })).toHaveAttribute("src", expect.stringMatching(/^data:image\/svg\+xml/));
    expect(screen.getByText(/^Signed Nov 4, 2026/)).toBeInTheDocument();
  });
});
