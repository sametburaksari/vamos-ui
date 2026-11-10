import { ex, type DocEntry } from "../types";
import MediaLibraryDemo from "../examples/media-library/demo";
import MediaLibraryListView from "../examples/media-library/list-view";
import MediaLibraryFolders from "../examples/media-library/folders";
import MediaLibraryBulk from "../examples/media-library/bulk";
import MediaLibraryFilters from "../examples/media-library/filters";
import MediaLibraryUploadQueue from "../examples/media-library/upload-queue";
import MediaLibraryReadonly from "../examples/media-library/readonly";
import MediaLibraryEmpty from "../examples/media-library/empty";

const entry: DocEntry = {
  slug: "media-library",
  title: "Media library",
  group: "Media",
  description:
    "Browse, search, filter, upload, edit and delete files through any storage adapter: grid or list, folders, an upload queue with progress and retry, a details panel with alt text, focal point and usage, bulk actions, and a virtualised grid for libraries with thousands of files. It is also the body of Media picker and works as a document archive in CRM and HR.",
  source: ["media/media-library.tsx", "media/use-upload-queue.ts", "media/rest-adapter.ts", "media/memory-adapter.ts", "media/media-utils.ts", "media/types.ts"],
  basedOn: "MediaAdapter contract · @tanstack/react-virtual · XHR uploads",
  usage: `import { MediaLibrary, MediaProvider, createRestAdapter } from "@vamos-ui/react/media";

const media = createRestAdapter({ baseUrl: "/api", headers: () => ({ Authorization: \`Bearer \${token()}\` }) });

<MediaProvider adapter={media}>
  <MediaLibrary selection="multiple" detailsPanel="side" onQueryChange={syncToUrl} />
</MediaProvider>`,
  demo: ex("demo", "Demo", "media-library/demo.tsx", MediaLibraryDemo),
  examples: [
    ex("list-view", "List view (HR documents)", "media-library/list-view.tsx", MediaLibraryListView, "A real <table> with type, size, date and alt status. accept narrows the library and the uploads to documents."),
    ex("folders", "Folders sidebar (CMS media screen)", "media-library/folders.tsx", MediaLibraryFolders, "folders=\"sidebar\" lists the adapter's folders with counts and a New folder action; selection=\"none\" makes a click open details."),
    ex("bulk", "Bulk actions", "media-library/bulk.tsx", MediaLibraryBulk, "Shift + click or Shift + arrows for ranges, Ctrl/⌘ + A for all. The bar moves, downloads or deletes (behind a confirm)."),
    ex("filters", "Controlled filters (URL sync)", "media-library/filters.tsx", MediaLibraryFilters, "query + onQueryChange make search, type, date, folder, uploader, Unattached and sort controllable; write them to the URL."),
    ex("upload-queue", "Upload queue: errors and retry", "media-library/upload-queue.tsx", MediaLibraryUploadQueue, "Three uploads at a time with progress; wrong types and files over capabilities.maxFileSize are rejected with a reason. maxDimension downscales large photos on the client."),
    ex("readonly", "Read-only", "media-library/readonly.tsx", MediaLibraryReadonly, "readOnly (or an adapter without edit) hides upload, delete and editing; details stay viewable."),
    ex("empty", "Empty library", "media-library/empty.tsx", MediaLibraryEmpty, "First use: drop files anywhere or press Upload."),
  ],
  api: [
    { name: "MediaLibrary", props: [
      { name: "adapter", type: "MediaAdapter", description: "Storage adapter. Default: the one from MediaProvider / VamosProvider media." },
      { name: "view / defaultView / onViewChange", type: '"grid" | "list"', default: '"grid"', description: "Grid of tiles or a table." },
      { name: "query / defaultQuery / onQueryChange", type: "MediaQuery", description: "search, kind, folderId, month (YYYY-MM), uploadedBy, unattached, sort. URL sync is the app's job." },
      { name: "selection", type: '"none" | "single" | "multiple"', default: '"multiple"', description: "none = browse (click opens details)." },
      { name: "selected / defaultSelected / onSelectedChange", type: "string[] · (ids, assets) => void", description: "Selected ids in order, plus the assets the library knows for them." },
      { name: "accept", type: "string", description: '"image/*,.pdf": filters the library and restricts uploads.' },
      { name: "max", type: "number", description: "Selection limit; other tiles are disabled once reached." },
      { name: "detailsPanel", type: '"side" | "dialog" | false', default: '"side"', description: "Where file details open (side panel falls back to a dialog under 768px)." },
      { name: "folders", type: '"select" | "sidebar" | false', default: '"select" with an adapter that has folders', description: "Folder control in the toolbar or as a sidebar." },
      { name: "pageSize", type: "number", default: "60", description: "Items per request; Load more fetches the next cursor." },
      { name: "tileSize", type: '"sm" | "md" | "lg"', default: '"md"', description: "Minimum tile width (104 / 148 / 212 px); columns follow the container width." },
      { name: "height", type: "number | string", default: '"34rem"', description: "Height of the scrolling file area." },
      { name: "virtualizeAfter", type: "number", default: "120", description: "Virtualise rows above this many items." },
      { name: "readOnly", type: "boolean", description: "Hide upload, delete and editing." },
      { name: "selectUploaded", type: "boolean", default: "false", description: "Select files as they finish uploading (Media picker sets it)." },
      { name: "maxDimension", type: "number", description: "Downscale images on the client so the longer side is at most this many pixels." },
      { name: "emptyState", type: "ReactNode", description: "Replaces the default “No files yet”." },
      { name: "toolbar", type: "boolean", default: "true", description: "Show the toolbar." },
      { name: "handleRef", type: "Ref<MediaLibraryHandle>", description: "addFiles(files), addAssets(assets, { select }), openFileDialog(), reload()." },
      { name: "searchRef", type: "Ref<HTMLInputElement>", description: "The search input (Media picker focuses it)." },
      { name: "onDeleted", type: "(ids: string[]) => void", description: "After a confirmed delete." },
      { name: "labels / queueLabels / detailsLabels", type: "Partial<…Labels>", description: "Built-in strings (dictionary namespaces mediaLibrary, mediaUploadQueue, mediaDetails)." },
    ] },
    { name: "MediaDetails", props: [
      { name: "asset", type: "MediaAsset", description: "The file to show." },
      { name: "adapter", type: "MediaAdapter", description: "Saves edits (update, replace, suggestAlt)." },
      { name: "onChange", type: "(asset) => void", description: "After each autosave." },
      { name: "onDelete / onClose", type: "(asset) => void · () => void", description: "Show Delete / close buttons." },
      { name: "autosaveDelay", type: "number", default: "700", description: "ms after typing stops; blur saves at once." },
      { name: "readOnly", type: "boolean", description: "View only." },
    ] },
    { name: "MediaUploadQueue", props: [
      { name: "queue", type: "UploadQueue", description: "From useUploadQueue()." },
      { name: "variant", type: '"inline" | "panel"', default: '"inline"', description: "Compact strip or a full upload page." },
    ] },
    { name: "useUploadQueue(adapter, options?)", props: [
      { name: "concurrency", type: "number", default: "3", description: "Parallel uploads." },
      { name: "accept / maxFileSize / validate", type: "string · number · (file) => string | null", description: "Client-side checks; failures show a reason and can't be retried." },
      { name: "maxDimension", type: "number", description: "Canvas downscale before upload (JPEG/PNG/WebP)." },
      { name: "onUploaded", type: "(asset, item) => void", description: "Per finished upload." },
      { name: "guardUnload", type: "boolean", default: "true", description: "Warn before leaving while uploads run." },
      { name: "→ returns", type: "{ add, items, cancel, retry, clearDone, active, done, total }", description: "items[].status: queued | uploading | processing | done | error | canceled." },
    ] },
    { name: "createRestAdapter(options)", props: [
      { name: "baseUrl", type: "string", description: "API root; endpoints live under {baseUrl}/media (GET, PATCH /:id, DELETE ?ids=, /uploads, /sideload, /folders, /events)." },
      { name: "headers", type: "HeadersInit | () => HeadersInit | Promise<HeadersInit>", description: "Static or per-request (fresh tokens)." },
      { name: "upload", type: '"presigned" | "multipart" | (file, opts) => Promise<MediaAsset>', default: '"presigned"', description: "Presign → XHR PUT with progress → complete; or one multipart POST; or createPresignedUpload({ sign, complete }) for S3/R2." },
      { name: "capabilities / loader", type: "Partial<MediaCapabilities> · ImageLoader", description: "What the server allows; CDN URL builder." },
      { name: "suggestAlt / events", type: 'boolean · "sse"', description: "POST /media/:id/suggest-alt · GET /media/events (EventSource)." },
      { name: "credentials / fetch", type: "RequestCredentials · typeof fetch", description: "Cookies; custom fetch for tests and SSR." },
    ] },
    { name: "createMemoryAdapter(options)", props: [
      { name: "seed / folders", type: "MediaAsset[] · MediaFolder[]", description: "Initial data; nothing persists." },
      { name: "latency / uploadDuration", type: "number", default: "120 / 900", description: "Simulated delays (ms)." },
      { name: "locale", type: "string", default: '"en-US"', description: "Search folding (tr: İstanbul matches istanbul)." },
    ] },
  ],
  notes: [
    "Keyboard (grid): arrows move, Home/End (row), Ctrl/⌘ + Home/End (all), Page Up/Down, Space selects, Shift extends, Ctrl/⌘ + A selects all, Enter opens details, Delete asks to delete, Esc clears the selection. The grid uses a roving tabindex, also when virtualised.",
    "Drop files anywhere on the library, or paste them; the whole area highlights while dragging. Uploads warn before the page is closed.",
    "A warning dot marks images without alt text. “Decorative image” in details clears the alt text and tags the asset decorative, so it stops counting as missing.",
    "Tiles never use backdrop blur: the library is one surface and tiles are flat surface-2, so hundreds of thumbnails stay smooth in glass mode.",
    "Sizes, dates, months and percentages follow the locale (tr: 2,4 MB, %42, Kasım 2026).",
  ],
  covers: ["Media library"],
};

export default entry;
