import * as React from "react";
import { screen } from "@testing-library/react";
import { Badge } from "./badge";
import { Button } from "./button";
import { RecordAside, RecordAsideSection, RecordHeader, RecordLayout, RecordMain, RecordPager, RecordSection } from "./record-detail-layout";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function ContactRecord({ onNext = () => {}, onPrevious = () => {}, ...props }: { onNext?: () => void; onPrevious?: () => void } & React.ComponentProps<typeof RecordLayout>) {
  return (
    <RecordLayout {...props}>
      <RecordHeader
        back={{ href: "/crm/contacts", label: "Contacts" }}
        title="Laura Callahan"
        subtitle="Head of Operations · Northwind Traders"
        status={<Badge tone="success">Customer</Badge>}
        facts={[
          { label: "Owner", value: "Meltem Aydın" },
          { label: "Lifetime value", value: "$48,500" },
        ]}
        actions={<Button variant="primary">Log activity</Button>}
        pager={<RecordPager index={3} total={128} onPrevious={onPrevious} onNext={onNext} />}
      />
      <RecordMain>
        <RecordSection title="Activity">Called about the renewal.</RecordSection>
      </RecordMain>
      <RecordAside>
        <RecordAsideSection title="Details">Email laura@northwind.example</RecordAsideSection>
        <RecordAsideSection title="Tags" collapsible>
          Enterprise
        </RecordAsideSection>
      </RecordAside>
    </RecordLayout>
  );
}

describe("RecordLayout", () => {
  it("renders header, main, aside landmarks and passes axe", async () => {
    renderWithProviders(<ContactRecord />);
    expect(screen.getByRole("heading", { level: 1, name: "Laura Callahan" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Details" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Key facts" })).toHaveTextContent("Meltem Aydın");
    expect(screen.getByRole("link", { name: "Contacts" })).toHaveAttribute("href", "/crm/contacts");
    expect(screen.getByText("3 of 128")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("pager buttons and j/k shortcuts", async () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    const { user } = renderWithProviders(<ContactRecord onNext={onNext} onPrevious={onPrevious} />);
    const next = screen.getByRole("button", { name: "Next record" });
    expect(next).toHaveAttribute("aria-keyshortcuts", "j");
    await user.click(next);
    expect(onNext).toHaveBeenCalledTimes(1);
    await user.keyboard("j");
    expect(onNext).toHaveBeenCalledTimes(2);
    await user.keyboard("k");
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it("collapsible aside sections toggle with the keyboard", async () => {
    const { user } = renderWithProviders(<ContactRecord />);
    const toggle = screen.getByRole("button", { name: "Tags" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Enterprise")).not.toBeInTheDocument();
  });

  it("resizable side column is a keyboard window splitter", async () => {
    const onWidth = vi.fn();
    const { user } = renderWithProviders(<ContactRecord resizable onAsideWidthChange={onWidth} />);
    const handle = screen.getByRole("separator", { name: "Resize side column" });
    expect(handle).toHaveAttribute("aria-valuenow", "320");
    handle.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onWidth).toHaveBeenLastCalledWith(336);
    expect(handle).toHaveAttribute("aria-valuenow", "336");
    await user.keyboard("{Home}");
    expect(handle).toHaveAttribute("aria-valuenow", "260");
  });

  it("read-only hides actions; not-found and loading states", async () => {
    const { rerender } = renderWithProviders(<ContactRecord readOnly />);
    expect(screen.queryByRole("button", { name: "Log activity" })).not.toBeInTheDocument();
    rerender(<ContactRecord state="not-found" />);
    expect(screen.getByRole("heading", { level: 1, name: "Record not found" })).toBeInTheDocument();
    rerender(<ContactRecord state="loading" />);
    expect(screen.getByRole("status", { name: "Loading record" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });
});
