import * as React from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "@testing-library/react";
import { Reveal, Stagger } from "./reveal";
import { CountUp } from "./count-up";

function Labelled({ n }: { n: number }) {
  const id = React.useId();
  return (
    <p>
      <label htmlFor={id}>Field {n}</label>
      <input id={id} />
    </p>
  );
}

let release: () => void = () => {};
const gate = new Promise<void>((r) => (release = r));
let ready = false;
function Slow({ children }: { children: React.ReactNode }) {
  if (typeof window !== "undefined" && !ready) throw gate.then(() => (ready = true));
  return <>{children}</>;
}

function App() {
  return (
    <main>
      <Labelled n={0} />
      <React.Suspense fallback={<p>loading</p>}>
        <Reveal>
          <Labelled n={1} />
          <CountUp value={1280} />
        </Reveal>
      </React.Suspense>
      <React.Suspense fallback={<p>loading</p>}>
        <Slow>
          <Stagger>
            <Labelled n={2} />
            <Labelled n={3} />
          </Stagger>
          <Labelled n={4} />
        </Slow>
      </React.Suspense>
      <Labelled n={5} />
    </main>
  );
}

describe("useFreshMount during hydration", () => {
  it("hydrates Reveal / Stagger / CountUp next to useId without a mismatch, also with a late Suspense boundary", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    let html = "";
    try {
      html = renderToString(<App />);
    } finally {
      vi.unstubAllGlobals();
    }
    const el = document.createElement("div");
    el.innerHTML = html;
    document.body.appendChild(el);
    const serverIds = [...el.querySelectorAll("input")].map((i) => i.id);
    const errors: string[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...a) => void errors.push(a.map(String).join(" ")));
    await act(async () => {
      hydrateRoot(el, <App />, { onRecoverableError: (e) => void errors.push(String(e)) });
    });
    await act(async () => {
      release();
      await gate;
      await new Promise((r) => setTimeout(r, 30));
    });
    spy.mockRestore();
    expect(errors).toEqual([]);
    expect([...el.querySelectorAll("input")].map((i) => i.id)).toEqual(serverIds);
  });
});
