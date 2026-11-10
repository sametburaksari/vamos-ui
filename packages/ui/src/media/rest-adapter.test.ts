import { createPresignedUpload, createRestAdapter, toSearchParams } from "./rest-adapter";

function mockFetch(body: unknown = {}, status = 200) {
  return vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify(body), { status }));
}

class FakeXHR {
  static last: FakeXHR;
  method = "";
  url = "";
  headers: Record<string, string> = {};
  status = 200;
  responseText = "";
  withCredentials = false;
  upload: { onprogress: ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  constructor() {
    FakeXHR.last = this;
  }
  open(m: string, u: string) {
    this.method = m;
    this.url = u;
  }
  setRequestHeader(k: string, v: string) {
    this.headers[k] = v;
  }
  send() {
    queueMicrotask(() => {
      this.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 100 });
      this.upload.onprogress?.({ lengthComputable: true, loaded: 100, total: 100 });
      this.onload?.();
    });
  }
  abort() {
    this.onabort?.();
  }
}

describe("createRestAdapter", () => {
  it("lists with query params and auth headers", async () => {
    const fetch = mockFetch({ items: [], total: 0 });
    const media = createRestAdapter({ baseUrl: "https://cms.example.com/api/", headers: () => ({ Authorization: "Bearer t0k" }), fetch });
    await media.list({ search: "harbour", kind: ["image", "video"], folderId: null, sort: "name", limit: 60 });
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://cms.example.com/api/media?search=harbour&kind=image%2Cvideo&folderId=null&sort=name&limit=60");
    expect((init!.headers as Record<string, string>).authorization).toBe("Bearer t0k");
  });

  it("patches, deletes and surfaces server errors", async () => {
    const fetch = mockFetch({ id: "m1", alt: "New" });
    const media = createRestAdapter({ baseUrl: "/api", fetch });
    await media.update("m1", { alt: "New" });
    expect(fetch.mock.calls[0]![0]).toBe("/api/media/m1");
    expect(fetch.mock.calls[0]![1]).toMatchObject({ method: "PATCH", body: '{"alt":"New"}' });
    await media.remove(["m1", "m2"], { permanent: true });
    expect(fetch.mock.calls[1]![0]).toBe("/api/media?ids=m1,m2&permanent=1");

    const failing = createRestAdapter({ baseUrl: "/api", fetch: mockFetch({ message: "Not allowed" }, 403) });
    await expect(failing.get("m1")).rejects.toThrow("Not allowed");
  });

  it("uploads through presign → PUT (with progress) → complete", async () => {
    const original = globalThis.XMLHttpRequest;
    globalThis.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest;
    try {
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ id: "up_1", url: "https://bucket.r2.dev/up_1" })))
        .mockResolvedValueOnce(new Response(JSON.stringify({ id: "m9", filename: "menu.pdf" })));
      const media = createRestAdapter({ baseUrl: "/api", fetch });
      const onProgress = vi.fn();
      const asset = await media.upload(new File(["%PDF"], "menu.pdf", { type: "application/pdf" }), { signal: new AbortController().signal, onProgress });
      expect(fetch.mock.calls[0]![0]).toBe("/api/media/uploads");
      expect(FakeXHR.last).toMatchObject({ method: "PUT", url: "https://bucket.r2.dev/up_1" });
      expect(FakeXHR.last.headers["Content-Type"]).toBe("application/pdf");
      expect(onProgress).toHaveBeenLastCalledWith({ loaded: 100, total: 100 });
      expect(fetch.mock.calls[1]![0]).toBe("/api/media/uploads/up_1/complete");
      expect(asset).toMatchObject({ id: "m9" });
    } finally {
      globalThis.XMLHttpRequest = original;
    }
  });

  it("createPresignedUpload stops when aborted before the PUT", async () => {
    const controller = new AbortController();
    const upload = createPresignedUpload({
      sign: async () => {
        controller.abort();
        return { id: "x", url: "https://bucket/x" };
      },
      complete: vi.fn(),
    });
    await expect(upload(new File(["a"], "a.txt"), { signal: controller.signal, onProgress: () => {} })).rejects.toThrow(/Abort/);
  });

  it("toSearchParams drops empty values", () => {
    expect(toSearchParams({ search: "", unattached: true, month: "2026-11", cursor: undefined })).toBe("unattached=true&month=2026-11");
  });
});
