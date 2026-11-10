import { Avatar } from "@vamos-ui/react";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

export default function AvatarSizes() {
  return (
    <div className="grid gap-5">
      <div className="flex items-end gap-3">
        {sizes.map((s) => (
          <Avatar key={s} size={s} name="Elif Kaya" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=faces" />
        ))}
      </div>
      <div className="flex items-end gap-3">
        {sizes.map((s) => (
          <Avatar key={s} size={s} name="Elif Kaya" />
        ))}
      </div>
      {/* square: organisations and workspaces */}
      <div className="flex items-end gap-3">
        {sizes.map((s) => (
          <Avatar key={s} size={s} shape="square" name="Northwind Traders" />
        ))}
      </div>
    </div>
  );
}
