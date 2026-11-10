import { Avatar, LocaleProvider } from "@vamos-ui/react";

const names = ["ilker şahin", "Işıl Yıldız", "Çağrı Öz", "inci Uğur"];

export default function AvatarLocaleInitials() {
  return (
    <div className="grid gap-4 text-xs text-fg-subtle">
      <div className="flex items-center gap-3">
        <span className="w-14">en-US</span>
        {names.map((n) => (
          <Avatar key={n} name={n} />
        ))}
      </div>
      {/* Turkish: i → İ, ı → I */}
      <LocaleProvider locale="tr-TR">
        <div className="flex items-center gap-3">
          <span className="w-14">tr-TR</span>
          {names.map((n) => (
            <Avatar key={n} name={n} />
          ))}
        </div>
      </LocaleProvider>
    </div>
  );
}
