import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Plus, Trash2 } from "lucide-react";
import { Button, IconButton } from "./button";

describe("Button", () => {
  it("defaults to type=button and exposes variant/size slots", async () => {
    const { container } = render(<Button variant="primary">Publish</Button>);
    const b = screen.getByRole("button", { name: "Publish" });
    expect(b).toHaveAttribute("type", "button");
    expect(b).toHaveAttribute("data-slot", "button");
    expect(b).toHaveAttribute("data-variant", "primary");
    expect(b).toHaveAttribute("data-size", "md");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("is keyboard operable", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("loading locks the button, shows one spinner and the loading text", () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading loadingText="Saving…" onClick={onClick}>
        <Plus /> Save
      </Button>,
    );
    const b = screen.getByRole("button");
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute("aria-busy", "true");
    expect(b).toHaveAttribute("data-loading");
    expect(b).toHaveTextContent("Saving…");
    expect(container.querySelectorAll('[data-slot="spinner"]')).toHaveLength(1);
    fireEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("replace mode keeps the label for width but hides it, and keeps the accessible name", () => {
    render(<Button loading loadingMode="replace">Publish</Button>);
    expect(screen.getByText("Publish")).toHaveClass("opacity-0");
    expect(screen.getByRole("button", { name: "Publish" })).toHaveAttribute("aria-busy", "true");
  });

  it("asChild renders the child and guards clicks while disabled", () => {
    const onClick = vi.fn();
    render(
      <Button asChild disabled onClick={onClick}>
        <a href="/posts/new">New post</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "New post" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("asChild loading injects the spinner into the child", () => {
    render(
      <Button asChild loading>
        <a href="/export">Export</a>
      </Button>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link.querySelector('[data-slot="spinner"]')).not.toBeNull();
  });
});

describe("IconButton", () => {
  it("requires and uses label as the accessible name", async () => {
    const { container } = render(
      <IconButton label="Delete post" size="lg">
        <Trash2 />
      </IconButton>,
    );
    const b = screen.getByRole("button", { name: "Delete post" });
    expect(b).toHaveAttribute("title", "Delete post");
    expect(b).toHaveAttribute("data-size", "icon-lg");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps its size while loading", () => {
    const { container } = render(
      <IconButton label="Refresh" loading>
        <Plus />
      </IconButton>,
    );
    expect(container.querySelector(".opacity-0 svg")).not.toBeNull();
  });
});
