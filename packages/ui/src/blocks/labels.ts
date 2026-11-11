// Built-in strings for site blocks (D2b). Server-safe: no context — pass `labels` or use createBlocks.

import { formatMessage } from "../lib/message-format";

/** English defaults. Keys are shared by every site block; wave-3 blocks add theirs here. */
export const blockLabels = {
  opensInNewTab: "(opens in a new tab)",
  skipToContent: "Skip to content",
  addTitle: "Add a title",
  addText: "Add text",
  addImage: "Add an image",
  unknownBlock: "Unknown block “{type}”",
  unknownBlockHint: "This block type is not installed. Its content is kept and will render again once the block is available.",
  invalidBlock: "“{type}” has invalid content",
  invalidBlockHint: "{count, plural, one {# field was} other {# fields were}} replaced with defaults. Fix them in the editor.",
  newerBlock: "“{type}” was saved by a newer version (v{v})",
  emptyImage: "No image",
  codeSample: "Code sample",
};

export type BlockLabels = typeof blockLabels;

/** Turkish dictionary for site blocks. */
export const blockLabelsTr: BlockLabels = {
  opensInNewTab: "(yeni sekmede açılır)",
  skipToContent: "İçeriğe geç",
  addTitle: "Başlık ekleyin",
  addText: "Metin ekleyin",
  addImage: "Görsel ekleyin",
  unknownBlock: "Bilinmeyen blok “{type}”",
  unknownBlockHint: "Bu blok türü kurulu değil. İçeriği korunuyor; blok yeniden eklendiğinde görünecek.",
  invalidBlock: "“{type}” geçersiz içerik barındırıyor",
  invalidBlockHint: "{count} alan varsayılan değerle değiştirildi. Düzenleyicide düzeltin.",
  newerBlock: "“{type}” daha yeni bir sürümle kaydedilmiş (v{v})",
  emptyImage: "Görsel yok",
  codeSample: "Kod örneği",
};

/** Label lookup for server components: `labels` prop → English. */
export function blockText(labels?: Partial<BlockLabels>, locale = "en-US"): (key: keyof BlockLabels, vars?: Record<string, unknown>) => string {
  const merged: BlockLabels = { ...blockLabels };
  if (labels) for (const k in labels) {
    const v = labels[k as keyof BlockLabels];
    if (typeof v === "string") merged[k as keyof BlockLabels] = v;
  }
  return (key, vars) => formatMessage(merged[key], vars, locale);
}
