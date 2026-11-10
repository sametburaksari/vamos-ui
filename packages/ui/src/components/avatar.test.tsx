import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Avatar, AvatarGroup } from "./avatar";
import { LocaleProvider } from "../lib/locale";

describe("Avatar", () => {
  it("shows initials with an accessible name and status", async () => {
    const { container } = render(<Avatar name="Ada Lovelace" status="online" />);
    const img = screen.getByRole("img", { name: "Ada Lovelace (Online)" });
    expect(img).toHaveTextContent("AL");
    expect(container.querySelector('[data-slot="avatar-status"]')).toHaveAttribute("data-status", "online");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses locale-correct initials", () => {
    render(
      <LocaleProvider locale="tr-TR">
        <Avatar name="ilker şahin" />
      </LocaleProvider>,
    );
    expect(screen.getByRole("img", { name: "ilker şahin" })).toHaveTextContent("İŞ");
  });

  it("picks the same colour for the same name", () => {
    render(
      <>
        <Avatar name="Selin Aydın" data-testid="a" />
        <Avatar name="Selin Aydın" data-testid="b" />
      </>,
    );
    const [a, b] = screen.getAllByRole("img");
    expect(a!.getAttribute("style")).toBe(b!.getAttribute("style"));
  });
});

describe("AvatarGroup", () => {
  const people = ["Ada Lovelace", "Grace Hopper", "Linus Torvalds", "Margaret Hamilton", "Alan Turing", "Katherine Johnson"];

  it("shows max avatars and a labelled +N", async () => {
    const { container } = render(
      <AvatarGroup max={3} aria-label="Assignees">
        {people.map((p) => (
          <Avatar key={p} name={p} />
        ))}
      </AvatarGroup>,
    );
    expect(screen.getAllByRole("img")).toHaveLength(4);
    expect(screen.getByRole("img", { name: "3 more people" })).toHaveTextContent("+3");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("overflow becomes a button with onOverflowClick and honours total", async () => {
    const onClick = vi.fn();
    render(
      <AvatarGroup max={2} total={12} onOverflowClick={onClick} aria-label="Attendees">
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
      </AvatarGroup>,
    );
    const more = screen.getByRole("button", { name: "10 more people" });
    await userEvent.click(more);
    expect(onClick).toHaveBeenCalled();
  });
});
