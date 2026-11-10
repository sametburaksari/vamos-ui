import * as React from "react";
import { act, screen, waitFor } from "@testing-library/react";
import { FilePlus2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
  CommandProvider,
  useCommandPalette,
  useRegisterCommands,
  type CommandAction,
} from "./command";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function Inline() {
  return (
    <Command>
      <CommandInput />
      <CommandList>
        <CommandEmpty />
        <CommandGroup heading="Offices">
          <CommandItem value="İstanbul">İstanbul</CommandItem>
          <CommandItem value="Izmir">Izmir</CommandItem>
          <CommandItem value="Berlin" icon={<FilePlus2 />} shortcut="mod+shift+b">Berlin</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe("Command (inline)", () => {
  it("renders a combobox + listbox and passes axe", async () => {
    renderWithProviders(<Inline />);
    expect(screen.getByRole("combobox")).toHaveAttribute("placeholder", "Type a command or search…");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await expectNoA11yViolations();
  });

  it("folds Turkish dotted İ for matching", async () => {
    const { user } = renderWithProviders(<Inline />, { locale: "tr-TR" });
    await user.type(screen.getByRole("combobox"), "istanbul");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("İstanbul");
  });

  it("shows the empty state", async () => {
    const { user } = renderWithProviders(<Inline />);
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });
});

const newPost = vi.fn();
const base: CommandAction[] = [
  { id: "cms.post.new", title: "New post", group: "Actions", keywords: ["article"], shortcut: "mod+shift+n", perform: newPost },
  { id: "nav.posts", title: "Posts", group: "Go to", href: "/posts" },
  {
    id: "theme",
    title: "Change theme",
    group: "Preferences",
    children: [
      { id: "theme.light", title: "Light" },
      { id: "theme.dark", title: "Dark" },
    ],
  },
];

function Palette({ actions = base, children }: { actions?: CommandAction[]; children?: React.ReactNode }) {
  return (
    <CommandProvider actions={actions}>
      {children}
      <CommandPalette />
    </CommandProvider>
  );
}

describe("CommandPalette", () => {
  beforeEach(() => {
    newPost.mockReset();
    localStorage.clear();
  });

  it("opens with Ctrl+K as a named dialog and passes axe", async () => {
    const { user } = renderWithProviders(<Palette />);
    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Actions" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("filters by title and keywords, Enter runs the action and closes", async () => {
    const { user } = renderWithProviders(<Palette />);
    await user.keyboard("{Control>}k{/Control}");
    const input = await screen.findByRole("combobox");
    await user.type(input, "article");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.keyboard("{Enter}");
    expect(newPost).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(JSON.parse(localStorage.getItem("ui-cmd-recent")!)).toEqual(["cms.post.new"]);
  });

  it("opens a sub-page and Backspace on an empty input goes back", async () => {
    const { user } = renderWithProviders(<Palette />);
    await user.keyboard("{Control>}k{/Control}");
    await user.type(await screen.findByRole("combobox"), "theme");
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("option", { name: "Light" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /New post/ })).toBeNull();
    await user.keyboard("{Backspace}");
    expect(await screen.findByRole("option", { name: /New post/ })).toBeInTheDocument();
  });

  it("page commands exist only while mounted", async () => {
    function EditorPage() {
      useRegisterCommands([{ id: "cms.post.publish", title: "Publish post", group: "This post" }]);
      return null;
    }
    function Harness() {
      const [mounted, setMounted] = React.useState(true);
      const palette = useCommandPalette();
      return (
        <>
          {mounted ? <EditorPage /> : null}
          <button onClick={() => setMounted(false)}>Leave editor</button>
          <button onClick={() => palette.open()}>Open palette</button>
        </>
      );
    }
    const { user } = renderWithProviders(
      <Palette>
        <Harness />
      </Palette>,
    );
    await user.click(screen.getByRole("button", { name: "Open palette" }));
    expect(await screen.findByRole("option", { name: "Publish post" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Leave editor" }));
    await user.click(screen.getByRole("button", { name: "Open palette" }));
    await screen.findByRole("dialog");
    expect(screen.queryByRole("option", { name: "Publish post" })).toBeNull();
  });

  it("queries async sources with debounce and shows their group", async () => {
    const search = vi.fn(async (q: string) => [{ id: `contact.${q}`, title: "Jane Doe", subtitle: "Northwind Traders" }]);
    function WithSource() {
      return (
        <CommandProvider sources={[{ id: "contacts", group: "Contacts", debounce: 10, search }]} actions={base}>
          <CommandPalette />
        </CommandProvider>
      );
    }
    const { user } = renderWithProviders(<WithSource />);
    await user.keyboard("{Control>}k{/Control}");
    await user.type(await screen.findByRole("combobox"), "ja");
    expect(await screen.findByRole("group", { name: "Contacts" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Jane Doe/ })).toBeInTheDocument();
    expect(search).toHaveBeenLastCalledWith("ja", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("global shortcuts run while closed", async () => {
    const { user } = renderWithProviders(<Palette actions={[{ ...base[0]!, global: true }]} />);
    await act(async () => {
      await user.keyboard("{Control>}{Shift>}n{/Shift}{/Control}");
    });
    expect(newPost).toHaveBeenCalledTimes(1);
  });
});
