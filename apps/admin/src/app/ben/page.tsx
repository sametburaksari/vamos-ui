"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Ticket, Phone, User, CalendarDays, HandCoins, MapPin, Home, UserPlus, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Badge,
  Button,
  DescriptionList,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@vamos-cms/ui";
import { fmtPhone, bloodTone, hasBlood, fmtTL, campaignTone } from "@/lib/no17-helpers";
import { FIXTURE, PREFILL } from "@/lib/no17-data";

const COMP: Record<string, string> = { SL: "Süper Lig", "ŞL": "Şampiyonlar Ligi", UWCL: "Kadın Ş. Ligi" };
const compLabel = (c: string) => COMP[c] ?? c;

/** Skordan sonuç tonu (Fenerbahçe önce): galibiyet / mağlubiyet / beraberlik. */
function scoreTone(score?: string): "success" | "danger" | "neutral" | null {
  if (!score) return null;
  const parts = score.split("-").map(Number);
  const a = parts[0];
  const b = parts[1];
  if (a === undefined || b === undefined || !Number.isFinite(a) || !Number.isFinite(b)) return null;
  return a > b ? "success" : a < b ? "danger" : "neutral";
}

type BiletInfo = {
  hasTicket: boolean;
  event?: string;
  seats?: string[];
  count?: number;
  downloadUrl?: string;
};

type Donation = { campaignId: string; title: string; type: string; amount: number; status: "paid" | "pledged"; date?: string };
type AttMatch = { matchId: string; guests: number; opp: string; date: string; comp: string; ha: string };
type RecordsInfo = { donations: Donation[]; matches: AttMatch[] };

type Profile = {
  key: string;
  name: string;
  tcMasked: string;
  hasTc: boolean;
  phone: string;
  blood: string;
  bday: string;
  kombine: boolean;
  uye: boolean;
  role: "admin" | "member";
};

export default function BenPage() {
  const router = useRouter();
  const [p, setP] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [bilet, setBilet] = React.useState<BiletInfo | null>(null);
  const [records, setRecords] = React.useState<RecordsInfo | null>(null);

  React.useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setP(d.ok ? d.profile : null))
      .finally(() => setLoading(false));
    fetch("/api/me/bilet")
      .then((r) => r.json())
      .then((d) => setBilet(d.ok ? d : { hasTicket: false }))
      .catch(() => setBilet({ hasTicket: false }));
    fetch("/api/me/records")
      .then((r) => r.json())
      .then((d) => setRecords(d.ok ? { donations: d.donations, matches: d.matches } : { donations: [], matches: [] }))
      .catch(() => setRecords({ donations: [], matches: [] }));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/giris");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <Spinner />
      </main>
    );
  }

  if (!p) {
    return (
      <main className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <p className="mb-3 text-fg-muted">Oturum bulunamadı.</p>
          <Button variant="solid" onClick={() => router.replace("/giris")}>Girişe dön</Button>
        </div>
      </main>
    );
  }

  const facts = [
    { key: "tc", label: "T.C. Kimlik No", value: p.tcMasked },
    { key: "phone", label: "Telefon", value: fmtPhone(p.phone) },
    { key: "blood", label: "Kan grubu", value: hasBlood(p.blood) ? p.blood : "—" },
    { key: "bday", label: "Doğum günü", value: p.bday || "—" },
    { key: "uye", label: "Durum", value: p.uye ? "Üye" : "Form kaydı" },
    { key: "kombine", label: "Kombine", value: p.kombine ? "Var" : "Yok" },
  ];

  // Üyenin listede olduğu maçlar (public PREFILL'den)
  const myMatches = FIXTURE.filter((f) => (PREFILL[f.id] ?? []).includes(p.key));

  // Kalıcı kayıtlar (sunucu): bağışlar + katıldığı maçlar
  const dons = records?.donations ?? [];
  const attended = records?.matches ?? [];
  const paidTotal = dons.filter((d) => d.status === "paid").reduce((s, d) => s + d.amount, 0);
  const pledgedTotal = dons.filter((d) => d.status === "pledged").reduce((s, d) => s + d.amount, 0);

  return (
    <main className="mx-auto min-h-dvh max-w-[760px] px-4 py-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-ui-sm bg-nav text-[color:var(--nav-fg-strong)] text-[13px] font-bold">17</div>
          <span className="font-semibold">NO:17</span>
        </div>
        <div className="flex items-center gap-2">
          {p.role === "admin" ? (
            <Button variant="secondary" size="sm" onClick={() => router.push("/no17")}>Yönetim</Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut /> Çıkış
          </Button>
        </div>
      </header>

      <div className="mb-(--gap) flex items-center gap-3">
        <Avatar size="lg" name={p.name} />
        <div>
          <h1 className="text-lg font-semibold tracking-[-0.01em]">{p.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone={p.uye ? "success" : "neutral"}>{p.uye ? "Üye" : "Form"}</Badge>
            {p.kombine ? <Badge tone="accent" dot>Kombine</Badge> : null}
            {hasBlood(p.blood) ? <Badge tone={bloodTone(p.blood)}>{p.blood}</Badge> : null}
          </div>
        </div>
      </div>

      <Tabs defaultValue="profil" orientation="vertical">
        <TabsList variant="underline" className="w-40 shrink-0">
          <TabsTrigger value="profil" icon={<User />}>Profilim</TabsTrigger>
          <TabsTrigger value="maclar" icon={<CalendarDays />} count={myMatches.length || undefined}>Maçlarım</TabsTrigger>
          <TabsTrigger value="bilet" icon={<Ticket />}>Biletim</TabsTrigger>
          <TabsTrigger value="bagis" icon={<HandCoins />}>Bağışlarım</TabsTrigger>
        </TabsList>

        {/* Profilim */}
        <TabsContent value="profil">
          <Card>
            <CardHeader title="Bilgilerim" description="Üyelik formundan gelen kendi bilgilerin. TC’n gizlilik için maskelidir." />
            <CardBody>
              <DescriptionList items={facts} />
            </CardBody>
          </Card>
        </TabsContent>

        {/* Maçlarım */}
        <TabsContent value="maclar">
          <div className="grid gap-(--gap)">
            <Card>
              <CardHeader
                title="Katıldığın maçlar"
                description="Maça giriş yaptığın (ve misafir getirdiğin) karşılaşmalar."
                action={attended.length ? <Badge tone="accent">{attended.length} maç</Badge> : undefined}
              />
              <CardBody>
                {records === null ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-fg-muted"><Spinner /> Yükleniyor…</div>
                ) : attended.length === 0 ? (
                  <p className="text-sm text-fg-muted">Kayıtlı maç katılımın görünmüyor.</p>
                ) : (
                  <ul className="grid gap-2">
                    {attended.map((m) => (
                      <li key={m.matchId} className="flex items-center gap-3 rounded-ui border border-line p-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-ui-sm bg-surface-2 text-fg-muted">
                          {m.ha === "İç" ? <Home className="size-4" /> : <MapPin className="size-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{m.opp}</div>
                          <div className="text-xs text-fg-muted">{m.date} · {compLabel(m.comp)} · {m.ha === "İç" ? "İç saha" : "Deplasman"}</div>
                        </div>
                        {m.guests > 0 ? (
                          <Badge tone="info"><UserPlus className="size-3" /> +{m.guests} misafir</Badge>
                        ) : null}
                        <Badge tone="success" dot><CheckCircle2 className="size-3" /> Girdin</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Listede olduğun maçlar"
                description={myMatches.length ? "Grup kadrosunda adının geçtiği maçlar." : undefined}
              />
              <CardBody>
                {myMatches.length === 0 ? (
                  <p className="text-sm text-fg-muted">Şu an listede olduğun bir maç yok.</p>
                ) : (
                  <ul className="grid gap-2">
                    {myMatches.map((f) => (
                      <li key={f.id} className="flex items-center gap-3 rounded-ui border border-line p-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-ui-sm bg-surface-2 text-fg-muted">
                          {f.ha === "İç" ? <Home className="size-4" /> : <MapPin className="size-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{f.opp}</div>
                          <div className="text-xs text-fg-muted">{f.date} · {compLabel(f.comp)} · {f.ha === "İç" ? "İç saha" : "Deplasman"}</div>
                        </div>
                        <Badge tone="success">Listede</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Tüm fikstür" description="Süper Lig ve Şampiyonlar Ligi — oynananlar skorlu." />
              <CardBody>
                <ul className="divide-y divide-line">
                  {FIXTURE.map((f) => {
                    const mine = myMatches.some((m) => m.id === f.id);
                    const tone = scoreTone(f.score);
                    return (
                      <li key={f.id} className="flex items-center gap-3 py-2">
                        <span className="w-12 shrink-0 text-xs text-fg-muted tabular-nums">{f.date}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{f.opp}</div>
                          <div className="text-[11px] text-fg-subtle">{compLabel(f.comp)} · {f.ha === "İç" ? "İç saha" : "Deplasman"}</div>
                        </div>
                        {f.score && tone ? (
                          <Badge tone={tone} className="font-mono tabular-nums">{f.score}</Badge>
                        ) : (
                          <span className="text-[11px] text-fg-subtle">—</span>
                        )}
                        {mine ? <Badge tone="success" dot>Listede</Badge> : null}
                      </li>
                    );
                  })}
                </ul>
              </CardBody>
            </Card>
          </div>
        </TabsContent>

        {/* Biletim */}
        <TabsContent value="bilet">
          <Card>
            <CardHeader title="Biletim" description={bilet?.event ?? "Real Sociedad (K) · 11.11.2026 · Maraton Üst D Blok"} />
            <CardBody className="grid gap-3">
              {bilet === null ? (
                <div className="flex items-center gap-2 py-2 text-sm text-fg-muted"><Spinner /> Bilet kontrol ediliyor…</div>
              ) : bilet.hasTicket ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="success" dot>Biletin hazır</Badge>
                    <Badge tone="accent">{bilet.count} koltuk</Badge>
                  </div>
                  {bilet.seats?.length ? (
                    <ul className="grid gap-1 text-sm">
                      {bilet.seats.map((seat) => (
                        <li key={seat} className="flex items-center gap-2 rounded-ui-sm bg-surface-2 px-3 py-1.5 tabular-nums">
                          <Ticket className="size-4 shrink-0 text-fg-subtle" /> {seat}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="solid">
                      <a href={bilet.downloadUrl} target="_blank" rel="noreferrer">
                        <Ticket /> Biletimi indir (PDF)
                      </a>
                    </Button>
                    {p.phone ? (
                      <Button asChild variant="secondary">
                        <a href={`tel:+9${p.phone}`}><Phone /> Grup iletişim</a>
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-fg-subtle">İndirme bağlantısı 30 dakika geçerlidir; süre dolarsa sayfayı yenile.</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-fg-muted">Bu maça tanımlı bir biletin görünmüyor. Bilet aldığını düşünüyorsan grup yönetimine yaz.</p>
                  <Button asChild variant="secondary">
                    <a href="https://no17-fener.vercel.app/bilet" target="_blank" rel="noreferrer">
                      <Ticket /> Bilet portalı
                    </a>
                  </Button>
                </>
              )}
            </CardBody>
          </Card>
        </TabsContent>

        {/* Bağışlarım */}
        <TabsContent value="bagis">
          <Card>
            <CardHeader
              title="Bağışlarım"
              description="Grup kampanyalarına yaptığın katkılar."
              action={
                paidTotal + pledgedTotal > 0 ? (
                  <div className="flex items-center gap-1.5">
                    {paidTotal > 0 ? <Badge tone="success">{fmtTL(paidTotal)} ödendi</Badge> : null}
                    {pledgedTotal > 0 ? <Badge tone="warning">{fmtTL(pledgedTotal)} söz</Badge> : null}
                  </div>
                ) : undefined
              }
            />
            <CardBody>
              {records === null ? (
                <div className="flex items-center gap-2 py-2 text-sm text-fg-muted"><Spinner /> Yükleniyor…</div>
              ) : dons.length === 0 ? (
                <p className="text-sm text-fg-muted">Kayıtlı bir katkın görünmüyor.</p>
              ) : (
                <ul className="grid gap-2">
                  {dons.map((d) => (
                    <li key={d.campaignId} className="flex items-center justify-between gap-2 rounded-ui border border-line p-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{d.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <Badge tone={campaignTone(d.type)}>{d.type}</Badge>
                          <Badge tone={d.status === "paid" ? "success" : "warning"} dot>
                            {d.status === "paid" ? "Ödendi" : "Söz verildi"}
                          </Badge>
                        </div>
                      </div>
                      <div className="shrink-0 font-semibold tabular-nums">{fmtTL(d.amount)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
