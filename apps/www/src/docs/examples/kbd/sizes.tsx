import { Kbd, KbdGroup } from "@vamos-ui/react";

export default function KbdSizes() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Kbd size="sm">Esc</Kbd>
        <Kbd>Esc</Kbd>
        <KbdGroup keys="shift+?" size="sm" variant="ghost" />
        <KbdGroup keys="mod+enter" variant="ghost" />
      </div>
      <div className="surface-nav flex w-fit items-center gap-3 rounded-ui px-3 py-2 text-[13px]">
        Quick switch <KbdGroup keys="mod+k" size="sm" variant="nav" />
      </div>
    </div>
  );
}
