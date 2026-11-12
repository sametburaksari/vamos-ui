"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, Save } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Field,
  Input,
  Button,
  Checkbox,
  Avatar,
  Badge,
} from "@vamos-cms/ui";
import { MEMBERS, FIXTURE } from "@/lib/no17-data";
import { MATCH_BY_ID, titlecase, fmtPhone, hasBlood } from "@/lib/no17-helpers";
import { useAttendance } from "@/lib/no17-store";
import { useLists } from "@/lib/no17-lists";
import { useMembersFull } from "@/lib/no17-sensitive";

const norm = (s: string) =>
  s.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/[şŞ]/g, "s").replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[üÜ]/g, "u").replace(/[öÖ]/g, "o");

export default function No17NewList() {
  const router = useRouter();
  const seedMatch = useSearchParams().get("match") ?? "";
  const { goingKeys } = useAttendance();
  const { create } = useLists();
  const membersFull = useMembersFull();

  const [name, setName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState<Set<string>>(() => new Set());
  const seeded = React.useRef(false);

  // Bir maçtan gelindiyse (deplasman "Liste yap") başlangıç seçimini doldur.
  React.useEffect(() => {
    if (seeded.current || !seedMatch) return;
    seeded.current = true;
    const m = MATCH_BY_ID[seedMatch];
    if (m) {
      setSel(new Set(goingKeys(seedMatch)));
      setName(`${m.opp} — ${m.ha === "İç" ? "iç saha" : "deplasman"} listesi`);
    }
  }, [seedMatch, goingKeys]);

  const presets: { label: string; keys: () => string[] }[] = [
    { label: "Tüm üyeler", keys: () => MEMBERS.map((m) => m.key) },
    { label: "Sadece asıl üyeler", keys: () => MEMBERS.filter((m) => m.uye).map((m) => m.key) },
    { label: "Kombineliler", keys: () => MEMBERS.filter((m) => m.kombine).map((m) => m.key) },
    { label: "TC'si olanlar", keys: () => MEMBERS.filter((m) => m.hasTc).map((m) => m.key) },
    ...FIXTURE.map((f) => ({ label: `${f.opp} katılımı`, keys: () => goingKeys(f.id) })),
  ];

  const toggle = (k: string) =>
    setSel((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const list = membersFull.filter((m) => !q || norm(m.name).includes(norm(q)));
  const save = () => {
    if (sel.size === 0) return;
    const keys = MEMBERS.filter((m) => sel.has(m.key)).map((m) => m.key); // üye sırasını koru
    const id = create(name, keys, note);
    router.push(`/no17/listeler/${id}`);
  };

  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader back={{ href: "/no17/listeler", label: "Listeler" }} title="Yeni liste" description="Mevcut üyelerden bir liste oluştur, kaydet, Excel'e aktar veya yazdır." />

      <Card className="mb-(--gap)">
        <CardHeader title="Liste bilgisi" />
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Field label="Liste adı">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ör. Çorum deplasman kadrosu" />
          </Field>
          <Field label="Not (opsiyonel)">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ör. 8 Kasım, otobüs 1" />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Kişileri seç"
          description="Hazır bir şablondan başla, sonra tek tek ekle/çıkar."
          action={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSel(new Set(MEMBERS.map((m) => m.key)))}>
                <Check /> Tümü
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSel(new Set())} disabled={sel.size === 0}>
                <X /> Temizle
              </Button>
            </div>
          }
        />
        <CardBody className="grid gap-3">
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <Button key={p.label} variant="secondary" size="xs" onClick={() => setSel(new Set(p.keys()))}>
                {p.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Input placeholder="İsim ara…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
            <span className="ml-auto text-sm text-fg-muted tabular-nums">{sel.size} seçili</span>
          </div>

          <div className="max-h-[48vh] divide-y divide-line overflow-auto rounded-ui-sm border border-line">
            {list.map((m) => (
              <label key={m.key} className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-hover">
                <Checkbox checked={sel.has(m.key)} onCheckedChange={() => toggle(m.key)} aria-label={titlecase(m.name)} />
                <Avatar size="sm" name={titlecase(m.name)} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{titlecase(m.name)}</div>
                  <div className="truncate text-xs text-fg-muted">
                    {fmtPhone(m.phone)}
                    {hasBlood(m.blood) ? ` · ${m.blood}` : ""}
                  </div>
                </div>
                {m.kombine ? <Badge tone="accent" dot>Kombine</Badge> : null}
              </label>
            ))}
          </div>
        </CardBody>
        <CardFooter className="justify-between">
          <span className="text-sm text-fg-muted">{sel.size} kişi listeye eklenecek</span>
          <Button variant="solid" onClick={save} disabled={sel.size === 0}>
            <Save /> Listeyi kaydet
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
