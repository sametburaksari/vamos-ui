import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Blockquote, Code, Heading, Lead, Numeric, Prose, ProseTable, Text } from "./typography";

describe("Typography", () => {
  it("decouples heading level from size", async () => {
    const { container } = render(
      <article>
        <Heading level={1} size="display">
          Dinner, <em>slowly</em>.
        </Heading>
        <Heading level={2} size="sm">
          Opening hours
        </Heading>
        <Lead>Seasonal plates from the Aegean coast.</Lead>
        <Text tone="muted">
          Use <Code>slug</Code> to set the address.
        </Text>
        <Blockquote attribution="Elif Kaya, head chef">Cook less, taste more.</Blockquote>
      </article>,
    );
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("data-size", "display");
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("data-size", "sm");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("default size follows level", () => {
    render(<Heading level={3}>Billing</Heading>);
    expect(screen.getByRole("heading", { level: 3 })).toHaveAttribute("data-size", "md");
  });

  it("Text truncation sets the title and line clamp", () => {
    render(
      <>
        <Text truncate>One line only</Text>
        <Text truncate={2} as="div">
          Two lines then an ellipsis
        </Text>
      </>,
    );
    expect(screen.getByText("One line only")).toHaveAttribute("title", "One line only");
    expect(screen.getByText("One line only")).toHaveClass("truncate");
    expect(screen.getByText("Two lines then an ellipsis").style.webkitLineClamp).toBe("2");
  });

  it("Prose renders HTML and wraps tables in a focusable region", async () => {
    const { container } = render(
      <Prose>
        <h2>Menu</h2>
        <p>
          Our <a href="/menu">full menu</a> changes weekly.
        </p>
        <ProseTable label="Prices">
          <table>
            <thead>
              <tr>
                <th>Dish</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Grilled octopus</td>
                <td>
                  <Numeric>$24.00</Numeric>
                </td>
              </tr>
            </tbody>
          </table>
        </ProseTable>
      </Prose>,
    );
    expect(screen.getByRole("region", { name: "Prices" })).toHaveAttribute("tabindex", "0");
    expect(container.firstElementChild).toHaveClass("prose-ui");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Prose html prop", () => {
    const { container } = render(<Prose size="lg" html="<p>Hello <strong>world</strong></p>" />);
    expect(container.querySelector("strong")).toHaveTextContent("world");
    expect(container.firstElementChild).toHaveClass("prose-ui-lg");
  });
});
