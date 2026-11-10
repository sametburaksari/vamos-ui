import { Pencil } from "lucide-react";
import { Badge, EntityCard, IconButton } from "@vamos-ui/react";

// Sample photos (Unsplash). Leave `media` out and the card shows a product icon instead.
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=480&h=360&q=70&auto=format&fit=crop`;

const products = [
  { name: "Linen Lounge Chair", sku: "SKU LC-2041 · Furniture", status: { tone: "success" as const, label: "In stock" }, price: "649.00", stock: 38, image: photo("1580480055273-228ff5388ef8"), alt: "Oatmeal linen lounge chair on oak legs" },
  { name: "Oak Side Table", sku: "SKU OT-1180 · Furniture", status: { tone: "warning" as const, label: "Low stock" }, price: "219.00", stock: 4, image: photo("1532372320572-cda25653a26d"), alt: "Solid oak side table with an open shelf" },
  { name: "Leather Sofa, Cognac", sku: "SKU LS-0932 · Furniture", status: { tone: "danger" as const, label: "Out of stock" }, price: "1890.00", stock: 0, image: photo("1540574163026-643ea20ade25"), alt: "Three-seat sofa in cognac leather" },
];

export default function EntityCardProduct() {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3">
      {products.map((p) => (
        <EntityCard
          key={p.sku}
          kind="product"
          name={p.name}
          subtitle={p.sku}
          media={{ src: p.image, alt: p.alt }}
          status={p.status}
          badges={p.stock === 0 ? <Badge tone="outline">Back Dec 2</Badge> : null}
          href={`#${p.sku}`}
          stats={[
            { label: "Price", value: p.price, format: "currency" },
            { label: "Stock", value: p.stock },
          ]}
          actions={
            <IconButton label={`Edit ${p.name}`} size="sm" variant="secondary" tooltip={false}>
              <Pencil />
            </IconButton>
          }
        />
      ))}
    </div>
  );
}
