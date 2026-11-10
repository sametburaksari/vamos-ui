import { LinkPreviewTabs, type LinkPreviewData } from "@vamos-cms/ui/media";

const post: LinkPreviewData = {
  url: "https://lenaspa.com.tr/journal/hammam-ritual-guide",
  title: "The Hammam Ritual, Step by Step — A First-Timer's Guide",
  description: "What happens in a traditional hammam, what to bring, and how to book your first 75-minute ritual at Lena Spa in Kadıköy.",
  siteName: "Lena Spa",
  publishedAt: "2026-11-08",
  breadcrumbs: ["Journal", "Guides"],
  image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=630&q=80&auto=format&fit=crop",
};

export default function LinkPreviewsDemo() {
  return <LinkPreviewTabs data={post} highlight="hammam ritual" className="w-full max-w-2xl" />;
}
