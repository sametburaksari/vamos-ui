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

/** German dictionary for site blocks. */
export const blockLabelsDe: BlockLabels = {
  opensInNewTab: "(öffnet in einem neuen Tab)",
  skipToContent: "Zum Inhalt springen",
  addTitle: "Titel hinzufügen",
  addText: "Text hinzufügen",
  addImage: "Bild hinzufügen",
  unknownBlock: "Unbekannter Block „{type}“",
  unknownBlockHint: "Dieser Blocktyp ist nicht installiert. Sein Inhalt bleibt erhalten und wird wieder angezeigt, sobald der Block verfügbar ist.",
  invalidBlock: "„{type}“ enthält ungültige Inhalte",
  invalidBlockHint: "{count, plural, one {# Feld wurde} other {# Felder wurden}} durch Standardwerte ersetzt. Korrigieren Sie sie im Editor.",
  newerBlock: "„{type}“ wurde mit einer neueren Version gespeichert (v{v})",
  emptyImage: "Kein Bild",
  codeSample: "Codebeispiel",
};

/** French dictionary for site blocks. */
export const blockLabelsFr: BlockLabels = {
  opensInNewTab: "(s’ouvre dans un nouvel onglet)",
  skipToContent: "Aller au contenu",
  addTitle: "Ajouter un titre",
  addText: "Ajouter du texte",
  addImage: "Ajouter une image",
  unknownBlock: "Bloc inconnu « {type} »",
  unknownBlockHint: "Ce type de bloc n’est pas installé. Son contenu est conservé et s’affichera de nouveau dès que le bloc sera disponible.",
  invalidBlock: "« {type} » contient des données non valides",
  invalidBlockHint: "{count, plural, one {# champ a été remplacé} other {# champs ont été remplacés}} par les valeurs par défaut. Corrigez-les dans l’éditeur.",
  newerBlock: "« {type} » a été enregistré avec une version plus récente (v{v})",
  emptyImage: "Aucune image",
  codeSample: "Exemple de code",
};

/** Spanish dictionary for site blocks. */
export const blockLabelsEs: BlockLabels = {
  opensInNewTab: "(se abre en una pestaña nueva)",
  skipToContent: "Saltar al contenido",
  addTitle: "Añade un título",
  addText: "Añade texto",
  addImage: "Añade una imagen",
  unknownBlock: "Bloque desconocido «{type}»",
  unknownBlockHint: "Este tipo de bloque no está instalado. Su contenido se conserva y volverá a mostrarse cuando el bloque esté disponible.",
  invalidBlock: "«{type}» tiene contenido no válido",
  invalidBlockHint: "{count, plural, one {Se ha sustituido # campo} other {Se han sustituido # campos}} por valores predeterminados. Corrígelos en el editor.",
  newerBlock: "«{type}» se guardó con una versión más reciente (v{v})",
  emptyImage: "Sin imagen",
  codeSample: "Ejemplo de código",
};

/** Arabic dictionary for site blocks. */
export const blockLabelsAr: BlockLabels = {
  opensInNewTab: "(يُفتح في علامة تبويب جديدة)",
  skipToContent: "انتقل إلى المحتوى",
  addTitle: "أضف عنوانًا",
  addText: "أضف نصًا",
  addImage: "أضف صورة",
  unknownBlock: "كتلة غير معروفة «{type}»",
  unknownBlockHint: "نوع الكتلة هذا غير مثبّت. يُحتفظ بمحتواها وستظهر مجددًا عند توفّر الكتلة.",
  invalidBlock: "تحتوي «{type}» على محتوى غير صالح",
  invalidBlockHint: "{count, plural, zero {لم يُستبدل أي حقل} one {استُبدل حقل واحد} two {استُبدل حقلان} few {استُبدلت # حقول} many {استُبدل # حقلًا} other {استُبدل # حقل}} بالقيم الافتراضية. صحّحها في المحرر.",
  newerBlock: "حُفظت «{type}» بإصدار أحدث (v{v})",
  emptyImage: "لا توجد صورة",
  codeSample: "مثال برمجي",
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
