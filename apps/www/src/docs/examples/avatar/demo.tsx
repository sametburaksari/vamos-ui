import { Avatar } from "@vamos-cms/ui";

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-3">
      <Avatar name="Selin Aydın" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces" size="lg" />
      <Avatar name="Marcus Bennett" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces" size="lg" />
      <Avatar name="Deniz Arslan" size="lg" />
      <Avatar name="Priya Raman" size="lg" />
      {/* broken image → initials */}
      <Avatar name="Tomás Ferreira" src="https://example.invalid/tomas.jpg" size="lg" />
    </div>
  );
}
