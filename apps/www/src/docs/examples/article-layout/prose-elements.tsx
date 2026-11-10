import { ArticleLayout } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Every body element: headings (anchored, locale-aware slugs), lists, quote, code, rule, marks and links.
export default function ArticleProseElements() {
  return (
    <SiteFrame>
      <ArticleLayout
        variant="minimal"
        locale="tr-TR"
        share={[]}
        post={{
          title: "Rezervasyon *kuralları*",
          publishedAt: "2026-11-01",
          body: {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ text: "Masalar " }, { text: "iki saatliğine", marks: [{ type: "bold" }] }, { text: " ayrılır; cuma ve cumartesi " }, { text: "20:30 seansı", marks: [{ type: "italic" }] }, { text: " için kapora alınır." }] },
              { type: "heading", level: 2, content: [{ text: "Kapora ve iptal" }] },
              { type: "list", items: [{ content: [{ type: "paragraph", content: [{ text: "Kişi başı ₺500, rezervasyonda iyzico ile." }] }] }, { content: [{ type: "paragraph", content: [{ text: "24 saat öncesine kadar ücretsiz iptal." }] }] }] },
              { type: "heading", level: 2, content: [{ text: "Özel günler" }] },
              { type: "list", ordered: true, items: [{ content: [{ type: "paragraph", content: [{ text: "Doğum günü pastası getirebilirsiniz." }] }] }, { content: [{ type: "paragraph", content: [{ text: "Üst kat 12 kişiye kadar özel kullanılır." }] }] }] },
              { type: "blockquote", content: [{ type: "paragraph", content: [{ text: "Geç kalacaksanız bir mesaj yeter; masanızı 20 dakika tutarız." }] }], cite: "Servis ekibi" },
              { type: "heading", level: 3, content: [{ text: "Çocuklar için" }] },
              { type: "paragraph", content: [{ text: "12 yaş altına yarım porsiyon; mama sandalyesi için " }, { text: "önceden haber verin", marks: [{ type: "highlight" }] }, { text: "." }] },
              { type: "hr" },
              { type: "code", text: "Kapora iadesi: rezervasyon_id → panel › Rezervasyonlar › İade" },
            ],
          },
        }}
      />
    </SiteFrame>
  );
}
