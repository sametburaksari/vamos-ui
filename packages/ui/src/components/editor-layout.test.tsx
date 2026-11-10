import * as React from "react";
import { screen } from "@testing-library/react";
import { Button } from "./button";
import { EditorBar, EditorCanvas, EditorLayout, EditorPanel, EditorPanelContent, EditorPanelSection, SaveStatus, type SaveState } from "./editor-layout";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function PostEditor({ state = "saved" as SaveState, ...props }: { state?: SaveState } & Partial<React.ComponentProps<typeof EditorLayout>>) {
  return (
    <EditorLayout stickyTop={0} {...props}>
      <EditorBar
        back={{ href: "/posts", label: "Posts" }}
        title="Spring menu launch"
        status={<SaveStatus state={state} at={new Date("2026-11-10T09:58:00Z")} now={new Date("2026-11-10T10:00:00Z")} onRetry={() => {}} />}
        actions={<Button variant="primary">Publish</Button>}
      />
      <EditorCanvas>
        <h1>Spring menu launch</h1>
      </EditorCanvas>
      <EditorPanel
        tabs={[
          { id: "doc", label: "Document" },
          { id: "block", label: "Block" },
        ]}
      >
        <EditorPanelContent value="doc">
          <EditorPanelSection id="test-status" title="Status" summary="Draft" defaultOpen>
            <label>
              Visibility <input defaultValue="Public" />
            </label>
          </EditorPanelSection>
          <EditorPanelSection id="test-seo" title="Search appearance" summary="Title and description">
            Meta
          </EditorPanelSection>
        </EditorPanelContent>
        <EditorPanelContent value="block">Paragraph settings</EditorPanelContent>
      </EditorPanel>
    </EditorLayout>
  );
}

beforeEach(() => window.localStorage.clear());

describe("EditorLayout", () => {
  it("renders bar, canvas and settings panel and passes axe", async () => {
    renderWithProviders(<PostEditor />);
    expect(screen.getByRole("complementary", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute("href", "/posts");
    expect(screen.getByRole("status")).toHaveTextContent(/Saved 2 min\. ago/);
    await expectNoA11yViolations();
  });

  it("panel toggle button and mod+shift+, shortcut", async () => {
    const { user } = renderWithProviders(<PostEditor />);
    const toggle = screen.getByRole("button", { name: "Settings panel" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls", screen.getByRole("complementary").id);
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    await user.keyboard("{Control>}{Shift>},{/Shift}{/Control}");
    expect(screen.getByRole("complementary", { name: "Settings" })).toBeVisible();
  });

  it("panel tabs and folding sections (state remembered per id)", async () => {
    const { user, unmount } = renderWithProviders(<PostEditor />);
    const seo = screen.getByRole("button", { name: /Search appearance/ });
    expect(seo).toHaveAttribute("aria-expanded", "false");
    expect(seo).toHaveTextContent("Title and description");
    await user.click(seo);
    expect(seo).toHaveAttribute("aria-expanded", "true");
    expect(window.localStorage.getItem("vui:editor-section:test-seo")).toBe("1");
    await user.click(screen.getByRole("tab", { name: "Block" }));
    expect(screen.getByText("Paragraph settings")).toBeInTheDocument();
    unmount();
    renderWithProviders(<PostEditor />);
    expect(screen.getByRole("button", { name: /Search appearance/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("focus mode hides the panel; Esc leaves it", async () => {
    const onFocus = vi.fn();
    const { user } = renderWithProviders(<PostEditor onFocusModeChange={onFocus} />);
    await user.keyboard("{Control>}{Shift>}f{/Shift}{/Control}");
    expect(onFocus).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onFocus).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("read-only hides actions and disables panel controls", () => {
    renderWithProviders(<PostEditor readOnly />);
    expect(screen.queryByRole("button", { name: "Publish" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Visibility/ })).toBeDisabled();
  });
});

describe("SaveStatus", () => {
  it("covers every state; errors are alerts with retry", async () => {
    const onRetry = vi.fn();
    const { rerender, user } = renderWithProviders(<SaveStatus state="dirty" />);
    expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes");
    rerender(<SaveStatus state="saving" />);
    expect(screen.getByRole("status")).toHaveTextContent("Saving…");
    rerender(<SaveStatus state="offline" />);
    expect(screen.getByRole("status")).toHaveTextContent("Offline · changes kept locally");
    rerender(<SaveStatus state="error" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("guards unload while dirty", () => {
    renderWithProviders(<SaveStatus state="dirty" />);
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
