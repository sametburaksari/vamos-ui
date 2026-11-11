// Launch checklist for a new store workspace (Kiln & Linen). Copy is `{ en, tr }`; people come
// from the shared fixtures so owners look the same as in every other block.
import type { L } from "../../_shared/l10n";

export type LaunchGroup = "business" | "money" | "launch";
export type LaunchStatus = "todo" | "done" | "skipped";
export type LaunchTaskId = "details" | "address" | "tax" | "payouts" | "domain" | "products" | "team" | "notify";

export interface LaunchTask {
  id: LaunchTaskId;
  group: LaunchGroup;
  title: L;
  /** One line under the title while the task is open. */
  lead: L;
  /** What the go-live check needs; optional tasks can be skipped. */
  required: boolean;
  minutes: number;
  /** Fixture person id. */
  owner: string;
  status: LaunchStatus;
  /** Shown once done: what was saved. */
  result?: L;
}

export const groupLabels: Record<LaunchGroup, L> = {
  business: { en: "Your business", tr: "İşletmeniz" },
  money: { en: "Getting paid", tr: "Ödeme almak" },
  launch: { en: "Store & team", tr: "Mağaza ve ekip" },
};

export const groupOrder: LaunchGroup[] = ["business", "money", "launch"];

export const launchTasks: LaunchTask[] = [
  {
    id: "details",
    group: "business",
    title: { en: "Company details", tr: "Şirket bilgileri" },
    lead: { en: "Printed on invoices, receipts and the store footer.", tr: "Faturalarda, fişlerde ve mağaza alt bilgisinde görünür." },
    required: true,
    minutes: 2,
    owner: "p-defne",
    status: "done",
    result: { en: "Kiln & Linen Ev Tekstili Ltd. · tax no. 4810 2266 93", tr: "Kiln & Linen Ev Tekstili Ltd. · VKN 4810 2266 93" },
  },
  {
    id: "address",
    group: "business",
    title: { en: "Shipping origin", tr: "Gönderim adresi" },
    lead: { en: "Where parcels leave from. Couriers quote rates from this address.", tr: "Kargoların çıktığı yer. Kargo firmaları ücreti bu adrese göre hesaplar." },
    required: true,
    minutes: 2,
    owner: "p-ruth",
    status: "todo",
  },
  {
    id: "tax",
    group: "business",
    title: { en: "VAT on products", tr: "Ürünlerde KDV" },
    lead: { en: "The default rate for new products. You can override it per product.", tr: "Yeni ürünlerin varsayılan oranı. Ürün bazında değiştirebilirsiniz." },
    required: true,
    minutes: 1,
    owner: "p-felix",
    status: "todo",
  },
  {
    id: "payouts",
    group: "money",
    title: { en: "Payout account", tr: "Ödeme hesabı" },
    lead: { en: "Card payments land here two business days after each order.", tr: "Kartla ödemeler her siparişten iki iş günü sonra bu hesaba geçer." },
    required: true,
    minutes: 3,
    owner: "p-felix",
    status: "todo",
  },
  {
    id: "domain",
    group: "launch",
    title: { en: "Connect your domain", tr: "Alan adını bağlayın" },
    lead: { en: "Add two records at your DNS provider, then check them here.", tr: "DNS sağlayıcınıza iki kayıt ekleyin, ardından buradan kontrol edin." },
    required: true,
    minutes: 8,
    owner: "p-viktor",
    status: "todo",
  },
  {
    id: "products",
    group: "launch",
    title: { en: "Add your first products", tr: "İlk ürünlerinizi ekleyin" },
    lead: { en: "A store needs at least one published product to go live.", tr: "Mağazanın yayına girmesi için en az bir yayında ürün gerekir." },
    required: true,
    minutes: 5,
    owner: "p-defne",
    status: "todo",
  },
  {
    id: "team",
    group: "launch",
    title: { en: "Invite your team", tr: "Ekibinizi davet edin" },
    lead: { en: "Each person gets an email and joins with the role you pick.", tr: "Her kişiye e-posta gider; seçtiğiniz rolle katılır." },
    required: false,
    minutes: 2,
    owner: "p-defne",
    status: "todo",
  },
  {
    id: "notify",
    group: "launch",
    title: { en: "Order notifications", tr: "Sipariş bildirimleri" },
    lead: { en: "Who hears about new orders, returns and low stock.", tr: "Yeni sipariş, iade ve düşük stoktan kim haberdar olsun." },
    required: false,
    minutes: 1,
    owner: "p-ruth",
    status: "todo",
  },
];

/** DNS records the domain task asks for (documentation values). */
export const dnsRecords = [
  { type: "CNAME", host: "shop", value: "stores.vamos-edge.example.com" },
  { type: "TXT", host: "_vamos-verify.shop", value: "vamos-site-verification=kl-7f3a91c2" },
];

export const sampleProducts: L[] = [
  { en: "Stoneware mug, ash glaze", tr: "Taş kupa, kül sırlı" },
  { en: "Washed linen tablecloth", tr: "Yıkanmış keten masa örtüsü" },
  { en: "Hand-thrown serving bowl", tr: "El yapımı servis kâsesi" },
];

export const roleOptions: { value: string; label: L }[] = [
  { value: "staff", label: { en: "Staff — orders and products", tr: "Personel — sipariş ve ürünler" } },
  { value: "admin", label: { en: "Admin — everything but billing", tr: "Yönetici — fatura hariç her şey" } },
  { value: "viewer", label: { en: "Viewer — read only", tr: "İzleyici — yalnızca görüntüleme" } },
];

export const launchDate = "2026-11-25";
