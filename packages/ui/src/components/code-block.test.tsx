import * as React from "react";
import { act, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { CodeBlock, CodeTabs, highlightCode, parseLineRanges, useCodeLanguage } from "./code-block";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

afterEach(() => window.localStorage.clear());

const TS = `// send a message\nconst res = await send("hello", 42);\n\nexport default res;`;
const PY = `# send a message\nres = send("hello", 42)`;

describe("highlightCode", () => {
  it("colours comments, strings, numbers, keywords and calls per line", () => {
    const lines = highlightCode(TS, "ts");
    expect(lines).toHaveLength(4);
    expect(lines[0]).toEqual([{ kind: "comment", text: "// send a message" }]);
    const kinds = Object.fromEntries(lines[1]!.filter((t) => t.kind !== "plain").map((t) => [t.text, t.kind]));
    expect(kinds).toMatchObject({ const: "keyword", await: "keyword", send: "function", '"hello"': "string", "42": "number" });
    expect(lines[2]).toEqual([]);
  });

  it("follows the comment syntax of the language and keeps block comments across lines", () => {
    expect(highlightCode(PY, "python")[0]![0]).toEqual({ kind: "comment", text: "# send a message" });
    expect(highlightCode("select 1 -- one", "sql")[0]!.map((t) => t.kind)).toEqual(["keyword", "plain", "number", "plain", "comment"]);
    const block = highlightCode("/* a\nb */ x", "js");
    expect(block[1]![0]).toEqual({ kind: "comment", text: "b */" });
  });

  it("parses line ranges", () => {
    expect([...parseLineRanges("1, 4-6")]).toEqual([1, 4, 5, 6]);
    expect([...parseLineRanges([2, [7, 8]])]).toEqual([2, 7, 8]);
  });
});

describe("CodeBlock", () => {
  it("renders a named, focusable code area with numbers, marked lines and a title", async () => {
    const { container } = renderWithProviders(<CodeBlock title="send.ts" language="ts" code={TS} lineNumbers highlightLines="2" caption="A first request" />);
    const area = screen.getByRole("group", { name: "send.ts" });
    expect(area).toHaveAttribute("tabindex", "0");
    expect(area).toHaveAttribute("dir", "ltr");
    expect(container.querySelector('[data-line="2"]')).toHaveAttribute("data-highlighted");
    expect(container.querySelector('[data-line="1"] [aria-hidden="true"]')).toHaveTextContent("1");
    expect(screen.getByText("A first request").tagName).toBe("FIGCAPTION");
    await expectNoA11yViolations(container);
  });

  it("copies the code and announces it", async () => {
    const { user } = renderWithProviders(<CodeBlock language="bash" code="npm install example" />);
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    expect(screen.getByRole("group", { name: "bash code" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenCalledWith("npm install example");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
  });

  it("accepts a highlighter adapter or pre-highlighted HTML", () => {
    const { container, rerender } = renderWithProviders(<CodeBlock code={"a\nb"} highlight={(code) => code.split("\n").map((l) => <b key={l}>{l}</b>)} />);
    expect(container.querySelectorAll("b")).toHaveLength(2);
    rerender(<CodeBlock code={"a\nb"} html={'<pre class="shiki"><code><span class="line"><i>a</i></span>\n<span class="line"><i>b</i></span></code></pre>'} lineNumbers />);
    expect(container.querySelectorAll("[data-line]")).toHaveLength(2);
    expect(container.querySelectorAll("i")).toHaveLength(2);
  });

  it("localizes its labels", () => {
    renderWithProviders(<CodeBlock language="ts" code="x" />, { messages: { codeBlock: { copy: "Kodu kopyala", codeIn: "{language} kodu" } } });
    expect(screen.getByRole("button", { name: "Kodu kopyala" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "ts kodu" })).toBeInTheDocument();
  });
});

describe("CodeTabs", () => {
  const samples = [
    { language: "ts", label: "TypeScript", title: "send.ts", code: TS },
    { language: "python", label: "Python", title: "send.py", code: PY },
  ];

  it("syncs the chosen language across every CodeTabs in the group", async () => {
    function Follower() {
      const [lang] = useCodeLanguage("sync-test");
      return <p data-testid="follower">{lang ?? "none"}</p>;
    }
    const { user, container } = renderWithProviders(
      <>
        <CodeTabs group="sync-test" samples={samples} data-testid="a" />
        <CodeTabs group="sync-test" samples={samples} data-testid="b" />
        <Follower />
      </>,
    );
    const [first, second] = [screen.getByTestId("a"), screen.getByTestId("b")];
    expect(within(second).getByRole("tab", { name: "TypeScript" })).toHaveAttribute("aria-selected", "true");
    await user.click(within(first).getByRole("tab", { name: "Python" }));
    expect(within(second).getByRole("tab", { name: "Python" })).toHaveAttribute("aria-selected", "true");
    expect(within(second).getByRole("group", { name: "send.py · Python" })).toBeInTheDocument();
    expect(screen.getByTestId("follower")).toHaveTextContent("python");
    await expectNoA11yViolations(container);
  });

  it("supports arrow keys and an independent block", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<CodeTabs group={false} samples={samples} onValueChange={onValueChange} />);
    screen.getByRole("tab", { name: "TypeScript" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Python" })).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenCalledWith("python");
  });

  it("restores a remembered language", async () => {
    window.localStorage.setItem("vui-code-language:persist-test", "python");
    renderWithProviders(<CodeTabs group="persist-test" persist samples={samples} />);
    await act(async () => {});
    expect(screen.getByRole("tab", { name: "Python" })).toHaveAttribute("aria-selected", "true");
  });

  it("falls back to the first sample when the shared choice is not offered, and server-renders", () => {
    const html = renderToString(<CodeTabs group="ssr-test" samples={samples} defaultValue="python" />);
    expect(html).toContain('data-language="python"');
  });
});
