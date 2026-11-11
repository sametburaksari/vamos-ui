// ERP navigation and inventory data for the Kiln & Linen back office.
import {
  Boxes, Calculator, ClipboardCheck, Factory, FileBarChart, PackageCheck, ShoppingCart, Truck, type LucideIcon,
} from "lucide-react";
import type { L } from "../_shared/l10n";

export interface ErpItem {
  id: string;
  label: L;
  count?: number;
  /** Count shown in the warning tone (needs action). */
  alert?: boolean;
}

export interface ErpSection {
  id: string;
  label: L;
  icon: LucideIcon;
  items: ErpItem[];
}

export const erpNav: ErpSection[] = [
  {
    id: "inventory", label: { en: "Inventory", tr: "Stok" }, icon: Boxes,
    items: [
      { id: "stock", label: { en: "Stock levels", tr: "Stok seviyeleri" } },
      { id: "movements", label: { en: "Movements", tr: "Hareketler" } },
      { id: "transfers", label: { en: "Transfers", tr: "Transferler" }, count: 3 },
      { id: "counts", label: { en: "Cycle counts", tr: "Sayımlar" }, count: 1, alert: true },
      { id: "warehouses", label: { en: "Warehouses & bins", tr: "Depolar ve raflar" } },
    ],
  },
  {
    id: "purchasing", label: { en: "Purchasing", tr: "Satın alma" }, icon: ShoppingCart,
    items: [
      { id: "po", label: { en: "Purchase orders", tr: "Satın alma siparişleri" }, count: 7 },
      { id: "receipts", label: { en: "Goods receipts", tr: "Mal kabul" }, count: 2 },
      { id: "suppliers", label: { en: "Suppliers", tr: "Tedarikçiler" } },
      { id: "price-lists", label: { en: "Supplier price lists", tr: "Tedarikçi fiyat listeleri" } },
    ],
  },
  {
    id: "sales", label: { en: "Sales & fulfilment", tr: "Satış ve sevkiyat" }, icon: Truck,
    items: [
      { id: "so", label: { en: "Sales orders", tr: "Satış siparişleri" }, count: 14 },
      { id: "picking", label: { en: "Pick lists", tr: "Toplama listeleri" }, count: 5 },
      { id: "shipments", label: { en: "Shipments", tr: "Sevkiyatlar" } },
      { id: "returns", label: { en: "Returns (RMA)", tr: "İadeler (RMA)" }, count: 2, alert: true },
    ],
  },
  {
    id: "manufacturing", label: { en: "Manufacturing", tr: "Üretim" }, icon: Factory,
    items: [
      { id: "bom", label: { en: "Bills of materials", tr: "Ürün ağaçları" } },
      { id: "work-orders", label: { en: "Work orders", tr: "İş emirleri" }, count: 4 },
      { id: "routing", label: { en: "Work centres", tr: "İş merkezleri" } },
    ],
  },
  {
    id: "quality", label: { en: "Quality", tr: "Kalite" }, icon: ClipboardCheck,
    items: [
      { id: "inspections", label: { en: "Inspections", tr: "Muayeneler" } },
      { id: "ncr", label: { en: "Non-conformances", tr: "Uygunsuzluklar" }, count: 1, alert: true },
    ],
  },
  {
    id: "accounting", label: { en: "Accounting", tr: "Muhasebe" }, icon: Calculator,
    items: [
      { id: "bills", label: { en: "Supplier bills", tr: "Tedarikçi faturaları" } },
      { id: "valuation", label: { en: "Stock valuation", tr: "Stok değerleme" } },
      { id: "landed", label: { en: "Landed costs", tr: "Varış maliyetleri" } },
    ],
  },
  {
    id: "reports", label: { en: "Reports", tr: "Raporlar" }, icon: FileBarChart,
    items: [
      { id: "abc", label: { en: "ABC analysis", tr: "ABC analizi" } },
      { id: "ageing", label: { en: "Stock ageing", tr: "Stok yaşlandırma" } },
      { id: "fill-rate", label: { en: "Fill rate", tr: "Karşılama oranı" } },
    ],
  },
];

export const pinnedItems: Array<{ id: string; label: L; icon: LucideIcon }> = [
  { id: "receiving", label: { en: "Receiving dock", tr: "Mal kabul rampası" }, icon: PackageCheck },
];

export interface Supplier {
  id: string;
  name: string;
  leadDays: number;
  categories: string[];
}

export const suppliers: Supplier[] = [
  { id: "sp-1", name: "Avanos Clayworks", leadDays: 12, categories: ["ceramics"] },
  { id: "sp-2", name: "Denizli Loom Co.", leadDays: 9, categories: ["textiles"] },
  { id: "sp-3", name: "Lumen Atölye", leadDays: 21, categories: ["lighting"] },
  { id: "sp-4", name: "Bakırköy Metal & Wood", leadDays: 14, categories: ["kitchen", "decor"] },
];

export const supplierFor = (category: string) => suppliers.find((s) => s.categories.includes(category)) ?? suppliers[0]!;

export const adjustReasons: Array<{ value: string; label: L }> = [
  { value: "count", label: { en: "Cycle count correction", tr: "Sayım düzeltmesi" } },
  { value: "damage", label: { en: "Damaged in warehouse", tr: "Depoda hasar" } },
  { value: "found", label: { en: "Found stock", tr: "Bulunan stok" } },
  { value: "sample", label: { en: "Marketing sample", tr: "Pazarlama numunesi" } },
];

/** Purchase orders already on the way (units per product id). */
export const onOrder: Record<string, number> = { "pr-02": 120, "pr-10": 60 };
