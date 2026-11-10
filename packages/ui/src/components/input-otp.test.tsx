import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./input";
import { InputOTP, InputOTPGroup, InputOTPRoot, InputOTPSlot } from "./input-otp";

// jsdom gap used by input-otp's password-manager detection.
document.elementFromPoint ??= () => null;

describe("InputOTP", () => {
  it("is one labelled input with one-time-code autofill and passes axe", async () => {
    const { container } = render(<InputOTP groups={[3, 3]} />);
    const input = screen.getByRole("textbox", { name: "Verification code, 6 digits" });
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("maxlength", "6");
    expect(container.querySelectorAll("[data-slot=input-otp-slot]")).toHaveLength(6);
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("accepts digits only, fills slots and fires onComplete once full", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(<InputOTP length={4} onValueChange={onChange} onComplete={onComplete} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("1a2");
    expect(onChange).toHaveBeenLastCalledWith("12");
    expect(container.querySelectorAll("[data-filled]")).toHaveLength(2);
    await user.keyboard("34");
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("uses the Field label, error and name", async () => {
    const { container } = render(
      <form aria-label="Sign in">
        <Field label="Code from your authenticator app" error="That code has expired.">
          <InputOTP name="code" defaultValue="481" />
        </Field>
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Code from your authenticator app" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("That code has expired.");
    expect(new FormData(container.querySelector("form")!).get("code")).toBe("481");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("masks characters, supports alphanumeric patterns and a verifying state", () => {
    const { container } = render(
      <InputOTPRoot maxLength={2} pattern="alphanumeric" mask loading defaultValue="A7" aria-label="Backup code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTPRoot>,
    );
    expect(container.querySelector("[data-slot=input-otp-slot]")).not.toHaveTextContent("A");
    const input = screen.getByRole("textbox", { name: "Backup code" });
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Verifying code…");
  });
});
