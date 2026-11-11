import * as React from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "@testing-library/react";
import { MediaLibrary } from "./media-library";
import { createMemoryAdapter } from "./memory-adapter";
import { mediaFolders, mediaSeed } from "./test-fixtures";
import { LocaleProvider, VamosProvider, ThemeScope } from "../index";

describe("MediaLibrary hydration", () => {
  it("hydrates without a mismatch", async () => {
    const make = () => createMemoryAdapter({ seed: mediaSeed, folders: mediaFolders, latency: 0, uploadDuration: 10 });
    const ui = (a: ReturnType<typeof make>) => (
      <LocaleProvider locale="en-US">
        <VamosProvider>
          <ThemeScope>
            <MediaLibrary adapter={a} query={{ sort: "newest" }} onQueryChange={() => {}} folders="sidebar" selection="multiple" detailsPanel="side" tileSize="md" height="40rem" aria-label="Media library" />
          </ThemeScope>
        </VamosProvider>
      </LocaleProvider>
    );
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    let html = "";
    try {
      html = renderToString(ui(make()));
    } finally {
      vi.unstubAllGlobals();
    }
    const el = document.createElement("div");
    el.innerHTML = html;
    document.body.appendChild(el);
    const errors: unknown[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...a) => void errors.push(a));
    await act(async () => {
      hydrateRoot(el, ui(make()), { onRecoverableError: (e) => errors.push(e) });
    });
    await act(async () => new Promise((r) => setTimeout(r, 50)));
    spy.mockRestore();
    expect(errors).toEqual([]);
  });
});
