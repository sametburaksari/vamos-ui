"use client";

import { MapPin } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, LocaleProvider } from "@vamos-ui/react";

const offices = ["İstanbul — Maltepe", "İzmir — Alsancak", "Ankara — Çankaya", "Iğdır — Merkez", "Şişli — Işık Sokak", "Berlin — Mitte"];

/** Type “istanbul”, “isik” or “sisli”: dotted/dotless i and Turkish letters fold for matching. */
export default function CommandLocaleSearch() {
  return (
    <LocaleProvider locale="tr-TR" messages={{ command: { placeholder: "Ofis ara…", empty: "Sonuç bulunamadı." } }}>
      <Command className="surface-popover w-full max-w-md rounded-ui-lg">
        <CommandInput />
        <CommandList>
          <CommandEmpty />
          <CommandGroup heading="Ofisler">
            {offices.map((o) => (
              <CommandItem key={o} value={o} icon={<MapPin />}>
                {o}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </LocaleProvider>
  );
}
