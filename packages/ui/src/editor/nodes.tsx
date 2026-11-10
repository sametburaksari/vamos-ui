"use client";

// ProseMirror nodes with React views: component blocks (the site's own component, rendered
// through the block registry) and images (figure + caption, upload states).

import * as React from "react";
import { Node, mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer, type Editor, type ReactNodeViewProps } from "@tiptap/react";
import { AlertTriangle, EyeOff, ImagePlus, PackageX, Upload } from "lucide-react";
import { cn } from "../lib/cn";
import { renderDoc } from "../render/block-renderer";
import { validateNode } from "../blocks/schema/validate";
import { sanitizeHref } from "../blocks/schema/safety";
import type { BlockNode } from "../blocks/schema/types";
import { Button } from "../components/button";
import { Spinner } from "../components/spinner";
import { useBlockEditor, type ImageUploader } from "./context";
import { COMPONENT_BLOCK, createBlockId } from "./convert";
import { iconForBlock } from "./items";

// ---------------------------------------------------------------- component block

const COMPONENT_ATTRS = ["blockType", "v", "variant", "props", "theme", "anchor", "hidden", "schedule", "slots", "content"] as const;

/** The BlockNode a component-block node stands for. */
export function blockNodeFromAttrs(attrs: Record<string, unknown>): BlockNode {
  const n: Record<string, unknown> = { id: (attrs.id as string) || "b_pending", type: String(attrs.blockType ?? "") };
  for (const k of COMPONENT_ATTRS) {
    if (k === "blockType") continue;
    const v = attrs[k];
    if (v !== null && v !== undefined) n[k] = v;
  }
  return n as unknown as BlockNode;
}

function ComponentBlockView({ node, selected }: ReactNodeViewProps) {
  const { registry, lang, t, readOnly } = useBlockEditor();
  const type = String(node.attrs.blockType ?? "");
  const def = registry.get(type);
  const block = React.useMemo(() => blockNodeFromAttrs(node.attrs), [node.attrs]);
  const issues = React.useMemo(() => (def ? validateNode(block, def).issues.length : 0), [block, def]);
  const rendered = React.useMemo(() => {
    if (!def?.component) return null;
    try {
      return renderDoc({ version: 1, lang, blocks: [{ ...block, hidden: undefined, schedule: undefined }] }, { registry, editMode: true, locale: lang, jsonLd: false, dev: false });
    } catch {
      return null;
    }
  }, [block, def, registry, lang]);
  const Icon = def ? iconForBlock(def.icon) : PackageX;
  const title = def?.title ?? type;

  return (
    <NodeViewWrapper
      className="vui-cblock"
      data-block-type={type}
      data-selected={selected ? "" : undefined}
      data-invalid={issues ? "" : undefined}
      data-unknown={def ? undefined : ""}
      data-hidden={block.hidden ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
    >
      <div className="vui-cblock-tag" contentEditable={false} aria-hidden={!selected && !issues ? true : undefined}>
        <Icon aria-hidden className="size-3" />
        <span className="truncate">{title}</span>
        {block.variant ? <span className="text-fg-subtle">· {block.variant}</span> : null}
        {block.hidden ? (
          <span className="inline-flex items-center gap-1 text-fg-muted">
            <EyeOff aria-hidden className="size-3" />
            {t("hiddenBadge")}
          </span>
        ) : null}
        {issues ? (
          <span className="inline-flex items-center gap-1 text-danger">
            <AlertTriangle aria-hidden className="size-3" />
            {t("invalidBlock", { count: issues })}
          </span>
        ) : null}
      </div>
      <div className="vui-cblock-render" contentEditable={false} role="group" aria-roledescription="block" aria-label={title} onClickCapture={(e) => (e.target as HTMLElement).closest("a, button") && e.preventDefault()}>
        {def ? (
          rendered
        ) : (
          <div className="vui-cblock-unknown" role="note">
            <PackageX aria-hidden className="size-5 shrink-0 text-fg-subtle" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-fg">{t("unknownBlock", { type })}</p>
              <p className="text-xs text-fg-muted">{t("unknownBlockHint")}</p>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

/** Atom node for registry blocks (`hero`, `faq`…). `attrs` mirror the BlockNode. */
export const ComponentBlockNode = Node.create({
  name: COMPONENT_BLOCK,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,
  addAttributes() {
    const out: Record<string, { default: unknown; rendered: false }> = {};
    for (const k of COMPONENT_ATTRS) out[k] = { default: null, rendered: false };
    return out;
  },
  parseHTML() {
    return [
      {
        tag: "div[data-vamos-block]",
        getAttrs: (el) => {
          try {
            const data = JSON.parse((el as HTMLElement).getAttribute("data-json") ?? "{}") as Record<string, unknown>;
            return { ...data, blockType: (el as HTMLElement).getAttribute("data-vamos-block") };
          } catch {
            return false;
          }
        },
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const data: Record<string, unknown> = {};
    for (const k of COMPONENT_ATTRS) if (k !== "blockType" && node.attrs[k] != null) data[k] = node.attrs[k];
    return ["div", mergeAttributes(HTMLAttributes, { "data-vamos-block": node.attrs.blockType, "data-json": JSON.stringify(data) })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ComponentBlockView);
  },
});

// ---------------------------------------------------------------- image

/** Inserts an uploading image node and swaps in the uploaded asset when the upload resolves. */
export function uploadImageFile(editor: Editor, file: File, uploader: ImageUploader, opts: { pos?: number; onError?: (e: unknown) => void } = {}): void {
  const token = createBlockId();
  const preview = typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(file) : null;
  const content = { type: "image", attrs: { src: preview, alt: "", uploading: file.name, uploadToken: token } };
  if (opts.pos !== undefined) editor.chain().insertContentAt(opts.pos, content).run();
  else editor.chain().focus().insertContent(content).run();
  const find = () => {
    let at = -1;
    editor.state.doc.descendants((n, pos) => {
      if (at >= 0) return false;
      if (n.type.name === "image" && n.attrs.uploadToken === token) at = pos;
      return undefined;
    });
    return at;
  };
  const ctrl = new AbortController();
  uploader(file, { signal: ctrl.signal })
    .then((res) => {
      const pos = find();
      if (pos < 0 || editor.isDestroyed) return;
      const node = editor.state.doc.nodeAt(pos)!;
      editor.view.dispatch(
        editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: res.src, alt: res.alt ?? node.attrs.alt ?? "", width: res.width ?? null, height: res.height ?? null, assetId: res.assetId ?? null, uploading: null, uploadToken: null, uploadError: null }),
      );
    })
    .catch((e: unknown) => {
      const pos = find();
      if (pos >= 0 && !editor.isDestroyed) {
        const node = editor.state.doc.nodeAt(pos)!;
        editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: null, uploading: null, uploadError: true }));
      }
      opts.onError?.(e);
    })
    .finally(() => {
      if (preview) URL.revokeObjectURL?.(preview);
    });
}

function ImageView({ node, selected, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const { t, uploadImage, readOnly, announce } = useBlockEditor();
  const [url, setUrl] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const src = node.attrs.src as string | null;
  const alt = (node.attrs.alt as string | null) ?? "";
  const caption = (node.attrs.caption as string | null) ?? "";
  const uploading = node.attrs.uploading as string | null;
  const missingAlt = !!src && !alt.trim() && !node.attrs.decorative && !uploading;
  const inputId = React.useId();

  const submitUrl = () => {
    const safe = sanitizeHref(url.trim());
    if (!safe) return;
    updateAttributes({ src: safe, uploadError: null });
    setUrl("");
  };
  const onFile = (file: File | undefined) => {
    if (!file || !uploadImage) return;
    const pos = typeof getPos === "function" ? getPos() : undefined;
    if (typeof pos === "number") {
      editor.chain().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
      uploadImageFile(editor, file, uploadImage, { pos, onError: () => announce(t("imageFailed")) });
    }
  };

  return (
    <NodeViewWrapper as="figure" className="vui-image" data-selected={selected ? "" : undefined} data-uploading={uploading ? "" : undefined}>
      {src ? (
        <div className="vui-image-frame" contentEditable={false}>
          <img src={src} alt={node.attrs.decorative ? "" : alt} width={(node.attrs.width as number | null) ?? undefined} height={(node.attrs.height as number | null) ?? undefined} draggable={false} />
          {uploading ? (
            <div className="vui-image-uploading" role="status">
              <Spinner size="sm" />
              <span>{t("imageUploading", { name: uploading })}</span>
            </div>
          ) : null}
          {missingAlt && !readOnly ? (
            <span className="vui-image-alt-flag">
              <AlertTriangle aria-hidden className="size-3" />
              {t("missingAlt")}
            </span>
          ) : null}
        </div>
      ) : readOnly ? null : (
        <div className="vui-image-empty" contentEditable={false}>
          <ImagePlus aria-hidden className="size-5 text-fg-subtle" />
          <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <label htmlFor={inputId} className="sr-only">
              {t("imageUrl")}
            </label>
            <input
              id={inputId}
              type="url"
              inputMode="url"
              value={url}
              placeholder={t("imageUrlPlaceholder")}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitUrl();
                }
              }}
              className="vui-image-url"
            />
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="secondary" onClick={submitUrl} disabled={!url.trim()}>
                {t("imageAdd")}
              </Button>
              {uploadImage ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
                    <Upload aria-hidden />
                    {t("imageUpload")}
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" hidden tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
                </>
              ) : null}
            </div>
          </div>
          {node.attrs.uploadError ? (
            <p className="text-xs text-danger" role="alert">
              {t("imageFailed")}
            </p>
          ) : null}
        </div>
      )}
      {src ? (
        readOnly ? (
          caption ? <figcaption>{caption}</figcaption> : null
        ) : (
          <figcaption contentEditable={false}>
            <input
              aria-label={t("caption")}
              value={caption}
              placeholder={t("captionPlaceholder")}
              onChange={(e) => updateAttributes({ caption: e.target.value || null })}
              className={cn("vui-image-caption", !caption && "is-empty")}
            />
          </figcaption>
        )
      ) : null}
    </NodeViewWrapper>
  );
}

/** Block image: `figure > img + figcaption`. */
export const ImageNode = Node.create({
  name: "image",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    const plain = (d: unknown = null) => ({ default: d, rendered: false });
    return {
      src: { default: null, parseHTML: (el: HTMLElement) => (el.tagName === "IMG" ? el : el.querySelector("img"))?.getAttribute("src") ?? null, rendered: false },
      alt: { default: null, parseHTML: (el: HTMLElement) => (el.tagName === "IMG" ? el : el.querySelector("img"))?.getAttribute("alt") ?? null, rendered: false },
      caption: { default: null, parseHTML: (el: HTMLElement) => el.querySelector?.("figcaption")?.textContent ?? null, rendered: false },
      width: plain(),
      height: plain(),
      focal: plain(),
      assetId: plain(),
      decorative: plain(),
      uploading: plain(),
      uploadToken: plain(),
      uploadError: plain(),
    };
  },
  parseHTML() {
    return [{ tag: "figure", getAttrs: (el) => ((el as HTMLElement).querySelector("img") ? null : false) }, { tag: "img[src]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const img = ["img", { src: node.attrs.src, alt: node.attrs.alt ?? "" }] as const;
    return node.attrs.caption ? ["figure", HTMLAttributes, img, ["figcaption", {}, node.attrs.caption]] : ["figure", HTMLAttributes, img];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});
