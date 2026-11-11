import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Search } from "lucide-react";
import { Field, Fieldset, Input, Legend, Textarea } from "./input";
import { LocaleProvider } from "../lib/locale";
import { tr } from "../locales/tr";

describe("Field", () => {
  it("wires label, hint and the control's own aria-describedby", async () => {
    const { container } = render(
      <>
        <p id="seo-tip">Shown in Google results.</p>
        <Field label="Title" hint="Keep it under 60 characters.">
          <Input aria-describedby="seo-tip" />
        </Field>
      </>,
    );
    const input = screen.getByLabelText("Title");
    expect(input).toHaveAccessibleDescription("Keep it under 60 characters. Shown in Google results.");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("error replaces hint, sets aria-invalid and accepts arrays", async () => {
    const { container } = render(
      <Field label="Email" hint="Work address" error={[undefined, "This address is already registered."]}>
        <Input type="email" defaultValue="hello@vamos.ist" />
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("This address is already registered.");
    expect(screen.queryByText("Work address")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("required marks the control and hides the asterisk from screen readers", () => {
    render(
      <Field label="Company" required>
        <Input />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Company" })).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden");
  });

  it("shows a localized (optional) and passes disabled / readOnly / name", () => {
    render(
      <LocaleProvider locale="tr-TR" messages={tr}>
        <Field label="Vergi dairesi" optional disabled readOnly name="taxOffice">
          <Input />
        </Field>
      </LocaleProvider>,
    );
    expect(screen.getByText("(isteğe bağlı)")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("name", "taxOffice");
  });

  it("wires plain native children by cloning and keeps a given child id", () => {
    render(
      <>
        <Field label="Country">
          <select defaultValue="TR">
            <option value="TR">Türkiye</option>
          </select>
        </Field>
        <Field label="Notes" hint="Internal only">
          <Textarea id="notes" />
        </Field>
      </>,
    );
    expect(screen.getByLabelText("Country").tagName).toBe("SELECT");
    const notes = screen.getByLabelText("Notes");
    expect(notes).toHaveAttribute("id", "notes");
    expect(notes).toHaveAccessibleDescription("Internal only");
  });

  it("supports horizontal and inline layouts", async () => {
    const { container } = render(
      <>
        <Field label="Email me when someone replies" hint="At most one email per hour." orientation="horizontal">
          <input type="checkbox" />
        </Field>
        <Field label="Display name" layout="inline" labelAction={<a href="#help">Help</a>}>
          <Input />
        </Field>
      </>,
    );
    expect(screen.getByRole("checkbox", { name: "Email me when someone replies" })).toHaveAccessibleDescription("At most one email per hour.");
    expect(screen.getByRole("link", { name: "Help" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Fieldset", () => {
  it("groups with a legend and hint", async () => {
    const { container } = render(
      <Fieldset legend="Notifications" hint="Choose where we reach you.">
        <Field label="Email" orientation="horizontal">
          <input type="checkbox" />
        </Field>
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Notifications" });
    expect(group).toHaveAccessibleDescription("Choose where we reach you.");
    expect(await axe(container)).toHaveNoViolations();
  });
  it("accepts a Legend child and a group error", () => {
    render(
      <Fieldset error="Pick at least one channel." disabled>
        <Legend>Channels</Legend>
        <input type="checkbox" aria-label="SMS" />
      </Fieldset>,
    );
    expect(screen.getByRole("group", { name: "Channels" })).toHaveAccessibleDescription("Pick at least one channel.");
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});

describe("Input", () => {
  it("puts className on the root and the ref on the input", () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<Input ref={ref} className="max-w-sm" inputClassName="tracking-wide" size="lg" aria-label="Title" />);
    expect(container.firstElementChild).toHaveClass("max-w-sm");
    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
    expect(ref.current?.tagName).toBe("INPUT");
    expect(ref.current).toHaveClass("tracking-wide");
  });

  it("clears with the button and with Escape (uncontrolled)", async () => {
    const onClear = vi.fn();
    const onChange = vi.fn();
    render(<Input aria-label="Search" leading={<Search />} clearable onClear={onClear} onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Search" });
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    await userEvent.type(input, "ayşe");
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    await userEvent.type(input, "kaya{Escape}");
    expect(input).toHaveValue("");
    expect(onClear).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: input }));
  });

  it("clears a controlled input through onChange", async () => {
    function Controlled() {
      const [v, setV] = React.useState("Kadıköy");
      return <Input aria-label="District" value={v} onChange={(e) => setV(e.target.value)} clearable />;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("counts characters and announces only near the limit", async () => {
    render(<Input aria-label="SEO title" maxLength={30} showCount defaultValue="Spring menu" />);
    const input = screen.getByRole("textbox");
    expect(screen.getByText("11 / 30")).toBeInTheDocument();
    const live = document.getElementById(input.getAttribute("aria-describedby")!)!;
    expect(live).toBeEmptyDOMElement();
    await userEvent.type(input, " is here at last");
    expect(screen.getByText("27 / 30")).toBeInTheDocument();
    expect(live).toHaveTextContent("3 characters left");
    await userEvent.type(input, "!!");
    expect(live).toHaveTextContent("1 character left");
  });

  it("renders addons, read-only and invalid states without violations", async () => {
    const { container } = render(
      <>
        <Input aria-label="Subdomain" addonStart="https://" addonEnd=".vamos.ist" defaultValue="northpoint" />
        <Input aria-label="Customer ID" readOnly defaultValue="CUS-20431" clearable />
        <Input aria-label="Phone" invalid />
      </>,
    );
    expect(screen.getByText("https://")).toBeInTheDocument();
    expect(screen.getByLabelText("Customer ID").closest("[data-slot=input]")).toHaveAttribute("data-readonly");
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    expect(screen.getByLabelText("Phone")).toHaveAttribute("aria-invalid", "true");
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Textarea showCount", () => {
  it("counts typed characters, links the live region and stays axe-clean", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Field label="Anything we should know first?">
        <Textarea maxLength={30} showCount />
      </Field>,
    );
    const box = screen.getByRole("textbox", { name: "Anything we should know first?" });
    expect(container.textContent).toContain("0 / 30");
    await user.type(box, "Evenings only");
    expect(container.textContent).toContain("13 / 30");
    const live = container.querySelector("[aria-live=polite]")!;
    expect(box.getAttribute("aria-describedby")).toContain(live.id);
    expect(live.textContent).toMatch(/17/);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a bare textarea without showCount", () => {
    const { container } = render(<Textarea aria-label="Notes" />);
    expect(container.firstElementChild?.tagName).toBe("TEXTAREA");
  });
});
