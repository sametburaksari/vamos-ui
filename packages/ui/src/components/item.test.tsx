import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Item, ItemActions, ItemContent, ItemDescription, ItemLeading, ItemList, ItemMeta, ItemSkeleton, ItemTitle } from "./item";

describe("Item", () => {
  it("renders a plain list with parts and hover-revealed actions", async () => {
    const { container } = render(
      <ItemList>
        <Item>
          <ItemLeading variant="icon">
            <svg aria-hidden />
          </ItemLeading>
          <ItemContent>
            <ItemTitle>A practical guide to QR menus for restaurants</ItemTitle>
            <ItemDescription>Samet · Today, 09:00</ItemDescription>
          </ItemContent>
          <ItemMeta>Published</ItemMeta>
          <ItemActions reveal="hover">
            <button aria-label="More actions for QR menus guide">…</button>
          </ItemActions>
        </Item>
        <Item disabled>
          <ItemContent>
            <ItemTitle>Archived post</ItemTitle>
          </ItemContent>
        </Item>
      </ItemList>,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("A practical guide to QR menus for restaurants")).toHaveAttribute("title", "A practical guide to QR menus for restaurants");
    const actions = container.querySelector('[data-slot="item-actions"]')!;
    expect(actions.className).toContain("group-focus-within/item:opacity-100");
    expect(actions.className).toContain("[@media(hover:none)]:opacity-100");
    expect(screen.getByText("Archived post").closest("li")).toHaveAttribute("aria-disabled", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("asChild link rows", async () => {
    const { container } = render(
      <ItemList>
        <Item asChild>
          <a href="/crm/contacts/42">
            <ItemContent>
              <ItemTitle>Ayşe Kaya</ItemTitle>
              <ItemDescription>Head of Sales · Northwind</ItemDescription>
            </ItemContent>
          </a>
        </Item>
      </ItemList>,
    );
    const link = screen.getByRole("link", { name: /Ayşe Kaya/ });
    expect(link).toHaveAttribute("data-slot", "item");
    expect(link.parentElement?.tagName).toBe("LI");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("selectable multiple: listbox keyboard and click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <ItemList selectable="multiple" aria-label="Assignees" onValueChange={onValueChange}>
        <Item value="ada">
          <ItemContent>
            <ItemTitle>Ada Lovelace</ItemTitle>
          </ItemContent>
        </Item>
        <Item value="grace" disabled>
          <ItemContent>
            <ItemTitle>Grace Hopper</ItemTitle>
          </ItemContent>
        </Item>
        <Item value="linus">
          <ItemContent>
            <ItemTitle>Linus Torvalds</ItemTitle>
          </ItemContent>
        </Item>
      </ItemList>,
    );
    const listbox = screen.getByRole("listbox", { name: "Assignees" });
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    const [ada, grace, linus] = screen.getAllByRole("option");
    expect(ada).toHaveAttribute("tabindex", "0");
    expect(grace).toHaveAttribute("aria-disabled", "true");
    await user.tab();
    expect(ada).toHaveFocus();
    await user.keyboard(" ");
    expect(ada).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(linus).toHaveFocus(); // skips the disabled option
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["ada", "linus"]);
    await user.keyboard("{Home}");
    expect(ada).toHaveFocus();
    await user.click(linus!);
    expect(linus).toHaveAttribute("aria-selected", "false");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("selectable single replaces the selection", async () => {
    const user = userEvent.setup();
    render(
      <ItemList selectable="single" aria-label="Plan" defaultValue={["pro"]}>
        <Item value="starter">Starter</Item>
        <Item value="pro">Pro</Item>
      </ItemList>,
    );
    expect(screen.getByRole("option", { name: "Pro" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("option", { name: "Starter" }));
    expect(screen.getByRole("option", { name: "Starter" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Pro" })).toHaveAttribute("aria-selected", "false");
  });

  it("empty slot and skeleton", () => {
    const { container } = render(
      <>
        <ItemList empty="No upcoming birthdays this month." />
        <ItemSkeleton count={4} />
      </>,
    );
    expect(screen.getByText("No upcoming birthdays this month.")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="item-skeleton"]')?.children).toHaveLength(4);
  });
});
