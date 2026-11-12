"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Palette,
  Users,
  HandCoins,
  Info,
  ShieldCheck,
  LogOut,
  ExternalLink,
  CalendarDays,
  Ticket,
} from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Badge,
  Button,
  DescriptionList,
  Spinner,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@vamos-cms/ui";
import { ThemeControls } from "@/components/theme-controls";
import { MEMBERS, FIXTURE } from "@/lib/no17-data";
import { fmtPhone, bloodTone, hasBlood, fmtTL, campaignTone } from "@/lib/no17-helpers";
import { useCampaigns } from "@/lib/no17-campaigns";

/* ------------------------------------------------------------------ */
/* Küçük sayaç kutusu                                                  */
/* ------------------------------------------------------------------ */

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-ui border border-line bg-surface-2 p-3">
      <div className="text-xs text-fg-muted">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums tracking-[-0.01em]">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-fg-subtle">{hint}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profil sekmesi (kendi oturumu)                                      */
/* ------------------------------------------------------------------ */

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

function ProfileTab() {
  const router = useRouter();
  const [p, setP] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setP(d.ok ? d.profile : null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/giris");
    router.refresh();
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="grid place-items-center py-16">
          <Spinner />
        </CardBody>
      </Card>
    );
  }

  if (!p) {
    return (
      <Card>
        <CardBody className="py-10 text-center text-fg-muted">Oturum bulunamadı.</CardBody>
      </Card>
    );
  }

  const facts = [
    { key: "tc", label: "T.C. Kimlik No", value: p.tcMasked },
    { key: "phone", label: "Telefon", value: fmtPhone(p.phone) },
    { key: "blood", label: "Kan grubu", value: hasBlood(p.blood) ? p.blood : "—" },
    { key: "bday", label: "Doğum günü", value: p.bday || "—" },
    { key: "uye", label: "Durum", value: p.uye ? "Üye" : "Form kaydı" },
    { key: "kombine", label: "Kombine", value: p.kombine ? "Var" : "Yok" },
    { key: "role", label: "Yetki", value: p.role === "admin" ? "Yönetici" : "Üye" },
  ];

  return (
    <Card>
      <CardHeader
        title="Hesabım"
        description="Oturumundaki kendi bilgilerin. TC numaran gizlilik için maskeli gösterilir."
        action={
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut /> Çıkış
          </Button>
        }
      />
      <CardBody className="grid gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg" name={p.name} />
          <div>
            <div className="text-base font-semibold tracking-[-0.01em]">{p.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge tone={p.role === "admin" ? "accent" : "neutral"} dot>
                {p.role === "admin" ? "Yönetici" : "Üye"}
              </Badge>
              {p.kombine ? <Badge tone="accent">Kombine</Badge> : null}
              {hasBlood(p.blood) ? <Badge tone={bloodTone(p.blood)}>{p.blood}</Badge> : null}
            </div>
          </div>
        </div>
        <DescriptionList items={facts} />
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Tema sekmesi                                                        */
/* ------------------------------------------------------------------ */

function ThemeTab() {
  return (
    <Card>
      <CardHeader title="Görünüm" description="Panelin rengini ve yoğunluğunu ayarla. Seçimin bu cihazda hatırlanır." />
      <CardBody className="grid gap-4">
        <ThemeControls />
        <p className="text-sm text-fg-muted">
          Varsayılan tema <strong>Fenerbahçe</strong> sarı-laciverttir. Açık/koyu mod, materyal ve yazı tipi tercihlerin
          yalnızca senin tarayıcında saklanır; başka üyeleri etkilemez.
        </p>
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Grup sekmesi                                                        */
/* ------------------------------------------------------------------ */

function GroupTab() {
  const total = MEMBERS.length;
  const uye = MEMBERS.filter((m) => m.uye).length;
  const kombine = MEMBERS.filter((m) => m.kombine).length;
  const withTc = MEMBERS.filter((m) => m.hasTc).length;
  const matches = FIXTURE.length;

  return (
    <div className="grid gap-(--gap)">
      <Card>
        <CardHeader title="Grup özeti" description="NO:17 üye havuzu ve fikstür — güncel sayılar." />
        <CardBody>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Toplam kayıt" value={total} hint="üye havuzu" />
            <Stat label="Asıl üye" value={uye} />
            <Stat label="Kombineli" value={kombine} />
            <Stat label="TC'si olan" value={withTc} hint={`${total - withTc} eksik`} />
            <Stat label="Fikstür" value={matches} hint="maç" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Yönetim kısayolları" />
        <CardBody className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <a href="/no17/uyeler"><Users /> Üyeler</a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href="/no17/maclar"><CalendarDays /> Maçlar</a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href="/no17/listeler"><Ticket /> Listeler</a>
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bağış sekmesi                                                       */
/* ------------------------------------------------------------------ */

function DonationTab() {
  const c = useCampaigns();
  const campaigns = c.campaigns;
  const grand = c.grandTotal();

  return (
    <div className="grid gap-(--gap)">
      <Card>
        <CardHeader
          title="Bağış & kampanyalar"
          description="Grubun açtığı para hikâyeleri — toplanan tutarlar."
          action={
            <Button asChild variant="ghost" size="sm">
              <a href="/no17/bagis"><ExternalLink /> Yönet</a>
            </Button>
          }
        />
        <CardBody className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Kampanya" value={campaigns.length} />
            <Stat label="Toplam toplanan" value={fmtTL(grand)} />
          </div>

          {campaigns.length === 0 ? (
            <p className="text-sm text-fg-muted">Henüz kampanya yok.</p>
          ) : (
            <ul className="grid gap-2">
              {campaigns.map((cm) => {
                const raised = c.totalOf(cm.id);
                const count = c.countOf(cm.id);
                const pct = cm.target ? Math.min(100, Math.round((raised / cm.target) * 100)) : null;
                return (
                  <li key={cm.id} className="rounded-ui border border-line p-3">
                    <div className="flex items-center justify-between gap-2">
                      <a href={`/no17/bagis/${cm.id}`} className="font-medium hover:underline">
                        {cm.title}
                      </a>
                      <Badge tone={campaignTone(cm.type)}>{count} katkı</Badge>
                    </div>
                    <div className="mt-1 text-sm text-fg-muted tabular-nums">
                      {fmtTL(raised)}
                      {cm.target ? <span className="text-fg-subtle"> / {fmtTL(cm.target)} hedef</span> : null}
                    </div>
                    {pct !== null ? <Progress value={pct} className="mt-2" /> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hakkında sekmesi                                                    */
/* ------------------------------------------------------------------ */

function AboutTab() {
  const facts = [
    { key: "name", label: "Panel", value: "NO:17 Taraftar grubu yönetimi" },
    { key: "login", label: "Giriş", value: "TC + doğum günü" },
    { key: "roles", label: "Roller", value: "Yönetici · Üye" },
  ];
  return (
    <div className="grid gap-(--gap)">
      <Card>
        <CardHeader title="Panel hakkında" />
        <CardBody>
          <DescriptionList items={facts} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Gizlilik" />
        <CardBody className="grid gap-2 text-sm text-fg-muted">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[color:var(--accent-ink)]" />
            <span>
              TC numaraları panelde <strong>maskeli</strong> gösterilir (ör. <span className="font-mono">163 •••• 96</span>).
              Tam TC yalnızca resmî liste dışa aktarımında ve bilet sorgu doğrulamasında kullanılır.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[color:var(--accent-ink)]" />
            <span>Üyeler yalnızca kendi bilgilerini görür; başka üyelerin verisine erişemez.</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sayfa — dikey tablar                                                */
/* ------------------------------------------------------------------ */

export default function AyarlarPage() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader breadcrumb="auto" title="Ayarlar" description="Hesap, görünüm, grup ve bağış ayarları." />

      <Tabs defaultValue="profil" orientation="vertical">
        <TabsList variant="underline" className="w-44 shrink-0">
          <TabsTrigger value="profil" icon={<User />}>Hesabım</TabsTrigger>
          <TabsTrigger value="tema" icon={<Palette />}>Görünüm</TabsTrigger>
          <TabsTrigger value="grup" icon={<Users />}>Grup</TabsTrigger>
          <TabsTrigger value="bagis" icon={<HandCoins />}>Bağış</TabsTrigger>
          <TabsTrigger value="hakkinda" icon={<Info />}>Hakkında</TabsTrigger>
        </TabsList>

        <TabsContent value="profil"><ProfileTab /></TabsContent>
        <TabsContent value="tema"><ThemeTab /></TabsContent>
        <TabsContent value="grup"><GroupTab /></TabsContent>
        <TabsContent value="bagis"><DonationTab /></TabsContent>
        <TabsContent value="hakkinda"><AboutTab /></TabsContent>
      </Tabs>
    </div>
  );
}
