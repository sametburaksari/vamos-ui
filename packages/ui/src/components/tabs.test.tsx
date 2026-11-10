import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Tabs, TabsContent, TabsLink, TabsLinkList, TabsList, TabsTrigger } from "./tabs";
import { VamosProvider } from "../lib/provider";

function Record(props: { onValueChange?: (v: string) => void; variant?: "underline" | "pill" | "segmented" }) {
  return (
    <Tabs defaultValue="overview" onValueChange={props.onValueChange}>
      <TabsList variant={props.variant} aria-label="Contact">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="deals" count={12}>
          Deals
        </TabsTrigger>
        <TabsTrigger value="files" disabled>
          Files
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview panel</TabsContent>
      <TabsContent value="activity">Activity panel</TabsContent>
      <TabsContent value="deals">Deals panel</TabsContent>
      <TabsContent value="files">Files panel</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders the tabs pattern without a11y violations", async () => {
    const { container } = render(<Record />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("appends the count to the accessible name", () => {
    render(<Record />);
    expect(screen.getByRole("tab", { name: /^Deals ?, ?12$/ })).toBeInTheDocument();
  });

  it("moves with arrow keys, Home/End and skips disabled tabs; panels unmount", async () => {
    const onValueChange = vi.fn();
    render(<Record onValueChange={onValueChange} variant="pill" />);
    await userEvent.click(screen.getByRole("tab", { name: "Overview" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith("activity");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");
    expect(screen.queryByText("Overview panel")).toBeNull();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: /Deals/ })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("data-selected");
  });

  it("supports vertical orientation", () => {
    render(
      <Tabs defaultValue="a" orientation="vertical">
        <TabsList aria-label="Settings">
          <TabsTrigger value="a">Profile</TabsTrigger>
          <TabsTrigger value="b">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Profile</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("link tabs are navigation with aria-current from currentPath", async () => {
    const { container } = render(
      <VamosProvider currentPath="/contacts/42/deals">
        <TabsLinkList aria-label="Contact sections">
          <TabsLink href="/contacts/42" exact>
            Overview
          </TabsLink>
          <TabsLink href="/contacts/42/deals" count={4}>
            Deals
          </TabsLink>
        </TabsLinkList>
      </VamosProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Contact sections" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Deals ?, ?4$/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });
});
