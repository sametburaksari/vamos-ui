import { LinkPreviewTabs, type LinkPreviewData } from "@vamos-ui/react/media";

const post: LinkPreviewData = {
  url: "https://bergamot.example/journal/website-sprint-guide",
  title: "The Two-Week Website Sprint, Step by Step — A First-Timer's Guide",
  description: "What happens in each of the ten working days, what to prepare, and how to book your first sprint with Bergamot Studio in Kadıköy.",
  siteName: "Bergamot Studio",
  publishedAt: "2026-11-08",
  breadcrumbs: ["Journal", "Guides"],
  image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=630&q=80&auto=format&fit=crop",
};

export default function LinkPreviewsDemo() {
  return <LinkPreviewTabs data={post} highlight="website sprint" className="w-full max-w-2xl" />;
}
