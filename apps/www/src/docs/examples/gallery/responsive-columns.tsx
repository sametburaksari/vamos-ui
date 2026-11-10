import { Gallery, type MediaSource } from "@vamos-cms/ui/media";

const people: MediaSource[] = [
  ["photo-1494790108377-be9c29b29330", "Elif Demir, Head of Design"],
  ["photo-1500648767791-00dcc994a43e", "Kerem Aydın, Engineering Lead"],
  ["photo-1534528741775-53994a69daeb", "Zeynep Şahin, Product Manager"],
  ["photo-1507003211169-0a1dd7228f2d", "Burak Öztürk, Sales Director"],
  ["photo-1438761681033-6461ffad8d80", "Selin Kaya, Customer Success"],
  ["photo-1500648767791-00dcc994a43e", "Can Yıldız, Data Analyst"],
].map(([id, name], i) => ({ id: `t${i}`, src: `https://images.unsplash.com/${id}?w=500&h=500&fit=crop&crop=faces&q=78`, width: 500, height: 500, alt: name!, caption: name }));

// Columns follow the gallery's own width (container queries), not the viewport.
export default function GalleryResponsiveColumns() {
  return <Gallery items={people} columns={{ base: 2, sm: 3, lg: 6 }} aspect="1/1" captions="below" rounded="ui-lg" label="Our team" className="w-full" />;
}
