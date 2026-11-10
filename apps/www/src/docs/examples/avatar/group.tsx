import { Avatar, AvatarGroup } from "@vamos-cms/ui";

const attendees = [
  { name: "Selin Aydın", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces" },
  { name: "Marcus Bennett", src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces" },
  { name: "Deniz Arslan" },
  { name: "Aiko Tanaka", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces" },
  { name: "Priya Raman" },
  { name: "Jonas Weber" },
  { name: "Lucía Moreno" },
];

export default function AvatarGroupExample() {
  return (
    <div className="grid gap-5">
      <AvatarGroup max={4} aria-label="Attendees">
        {attendees.map((a) => (
          <Avatar key={a.name} name={a.name} src={a.src} />
        ))}
      </AvatarGroup>
      <AvatarGroup max={3} size="sm" spacing="lg" aria-label="Assignees">
        {attendees.map((a) => (
          <Avatar key={a.name} name={a.name} src={a.src} />
        ))}
      </AvatarGroup>
      {/* total: the list was already cut on the server */}
      <AvatarGroup max={5} total={48} size="lg" aria-label="Members of Design Guild">
        {attendees.slice(0, 5).map((a) => (
          <Avatar key={a.name} name={a.name} src={a.src} />
        ))}
      </AvatarGroup>
    </div>
  );
}
