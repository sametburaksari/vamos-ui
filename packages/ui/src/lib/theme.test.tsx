import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import * as Popover from "radix-ui/popover";
import { ThemeScope, themeAttributes, usePortalContainer } from "./theme-scope";
import { Layer, useLayerDepth } from "./layer";
import { SmartLink, VamosProvider, useCan, useNavigation } from "./provider";
import { useFieldControl, FieldContext } from "./field-context";

describe("ThemeScope", () => {
  it("applies axes and portals overlays into the scope", () => {
    function Pop() {
      return (
        <Popover.Root defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Portal container={usePortalContainer()}>
            <Layer asChild>
              <Popover.Content aria-label="Filters">Filters</Popover.Content>
            </Layer>
          </Popover.Portal>
        </Popover.Root>
      );
    }
    render(
      <ThemeScope data-testid="scope" theme="dark" material="glass" accent="ocean" density="compact" font="grotesk" radius="sharp">
        <Pop />
      </ThemeScope>,
    );
    const scope = screen.getByTestId("scope");
    expect(scope).toHaveClass("dark");
    expect(scope).toHaveAttribute("data-material", "glass");
    expect(scope).toHaveAttribute("data-accent", "ocean");
    expect(scope).toHaveAttribute("data-density", "compact");
    expect(scope).toHaveAttribute("data-font", "grotesk");
    expect(scope).toHaveAttribute("data-radius", "sharp");
    const content = screen.getByText("Filters");
    expect(scope.contains(content)).toBe(true);
    expect(content).toHaveAttribute("data-layer-depth", "1");
  });
  it("themeAttributes is a plain function", () => {
    expect(themeAttributes({ theme: "light", accent: "ember", glassQuality: "low" })).toMatchObject({ className: "light", "data-accent": "ember", "data-glass-quality": "low" });
  });
  it("maps corners to data-radius and leaves the default out", () => {
    expect(themeAttributes({ accent: "ocean", radius: "round" })).toMatchObject({ "data-accent": "ocean", "data-radius": "round" });
    expect(themeAttributes({ radius: "default" })["data-radius"]).toBeUndefined();
    expect(themeAttributes({})["data-radius"]).toBeUndefined();
  });
});

describe("Layer", () => {
  it("increments depth for nested layers", () => {
    function Depth() {
      return <span data-testid="d">{useLayerDepth()}</span>;
    }
    render(
      <Layer data-testid="l1">
        <Layer data-testid="l2">
          <Depth />
        </Layer>
      </Layer>,
    );
    expect(screen.getByTestId("l1")).toHaveAttribute("data-layer-depth", "1");
    expect(screen.getByTestId("l2")).toHaveAttribute("data-layer-depth", "2");
    expect(screen.getByTestId("d").textContent).toBe("2");
  });
});

describe("VamosProvider", () => {
  it("routes internal links through the app Link and externals to a new tab", () => {
    const AppLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function AppLink(props, ref) {
      return <a ref={ref} data-router="" {...props} />;
    });
    render(
      <VamosProvider Link={AppLink}>
        <SmartLink href="/posts">Posts</SmartLink>
        <SmartLink href="https://vamos.ist">Website</SmartLink>
        <SmartLink href="mailto:hello@vamos.ist">Email</SmartLink>
      </VamosProvider>,
    );
    expect(screen.getByText("Posts")).toHaveAttribute("data-router");
    expect(screen.getByText("Website")).toHaveAttribute("target", "_blank");
    expect(screen.getByText("Website")).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Email")).not.toHaveAttribute("target");
  });
  it("provides navigation, isActive and can", () => {
    const navigate = vi.fn();
    function Probe() {
      const nav = useNavigation();
      const can = useCan();
      return (
        <button onClick={() => nav.navigate("/crm/deals")} data-active={String(nav.isActive("/posts"))} data-exact={String(nav.isActive("/posts", { exact: true }))} data-can={String(can("posts.delete"))}>
          Go
        </button>
      );
    }
    render(
      <VamosProvider navigate={navigate} currentPath="/posts/12/" can={(p) => p !== "posts.delete"}>
        <Probe />
      </VamosProvider>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-active", "true");
    expect(btn).toHaveAttribute("data-exact", "false");
    expect(btn).toHaveAttribute("data-can", "false");
    fireEvent.click(btn);
    expect(navigate).toHaveBeenCalledWith("/crm/deals");
  });
});

describe("useFieldControl", () => {
  it("merges describedby and fills state from the Field", () => {
    function Control(props: { "aria-describedby"?: string; required?: boolean }) {
      const p = useFieldControl(props);
      return <input {...p} />;
    }
    render(
      <FieldContext.Provider value={{ id: "email", describedBy: "email-hint", invalid: true, required: true, disabled: false, readOnly: false }}>
        <Control aria-describedby="own" />
      </FieldContext.Provider>,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAttribute("aria-describedby", "email-hint own");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
  });
});
