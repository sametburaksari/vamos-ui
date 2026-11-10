import { SearchPreview, type LinkPreviewData } from "@vamos-ui/react/media";

const page: LinkPreviewData = {
  url: "https://atlaslojistik.com/services/same-day-delivery-istanbul",
  title: "Same-Day Delivery in Istanbul for E-commerce Brands, Retailers and Marketplaces | Atlas Lojistik",
  description:
    "Order by 13:00, delivered by 21:00 anywhere on both sides of the city. Live tracking, cash on delivery and returns handled by the same courier. Get a quote in two minutes.",
  siteName: "Atlas Lojistik",
};

// The long title is cut where Google cuts it (≈600 px desktop), with the ellipsis at a word.
export default function LinkPreviewsSearch() {
  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="grid gap-2">
        <p className="text-[12px] font-medium text-fg-muted">Desktop</p>
        <SearchPreview data={page} highlight="same-day delivery" />
      </div>
      <div className="grid gap-2">
        <p className="text-[12px] font-medium text-fg-muted">Mobile</p>
        <SearchPreview data={page} device="mobile" highlight="same-day delivery" />
      </div>
    </div>
  );
}
