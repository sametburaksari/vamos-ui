"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, Users } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Avatar,
  Button,
  Input,
  Textarea,
  Field,
  NativeSelect,
  CurrencyInput,
  Switch,
  Progress,
  Stat,
  StatGroup,
  StatLabel,
  StatValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EmptyState,
} from "@vamos-cms/ui";
import { MEMBERS } from "@/lib/no17-data";
import { titlecase, fmtTL, campaignTone } from "@/lib/no17-helpers";
import { useCampaigns, campaignTypeLabel, CAMPAIGN_TYPES, type CampaignType } from "@/lib/no17-campaigns";

const norm = (s: string) =>
  s.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/[şŞ]/g, "s").replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[üÜ]/g, "u").replace(/[öÖ]/g, "o");

export default function No17CampaignDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = decodeURIComponent(params.id);
  const { get, update, remove, setContribution, contributionOf, contributorsOf, totalOf, countOf } = useCampaigns();
  const c = get(id);

  const [q, setQ] = React.useState("");
  const [onlyGivers, setOnlyGivers] = React.useState(false);

  if (!c) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <PageHeader back={{ href: "/no17/bagis", label: "Bağış" }} title="Kampanya bulunamadı" />
        <EmptyState kind="no-results" title="Bu kampanya yok" description="Silinmiş ya da bağlantı hatalı olabilir." />
      </div>
    );
  }

  const total = totalOf(id);
  const pct = c.target && c.target > 0 ? Math.min(100, Math.round((total / c.target) * 100)) : null;

  const rows = MEMBERS.filter((m) => {
    if (onlyGivers && contributionOf(id, m.key) <= 0) return false;
    return !q || norm(m.name).includes(norm(q));
  });

  const del = () => {
    if (window.confirm(`"${c.title}" kampanyasını ve tüm katkı kayıtlarını silmek istediğine emin misin?`)) {
      remove(id);
      router.push("/no17/bagis");
    }
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        back={{ href: "/no17/bagis", label: "Bağış" }}
        title={c.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Badge tone={campaignTone(c.type)}>{campaignTypeLabel(c.type)}</Badge>
            {c.closed ? <Badge tone="neutral">Kapandı</Badge> : <Badge tone="success" dot>Açık</Badge>}
            <Badge tone="info">{countOf(id)} katkı</Badge>
          </span>
        }
        actions={
          <Button variant={c.closed ? "secondary" : "ghost"} onClick={() => update(id, { closed: !c.closed })}>
            {c.closed ? "Yeniden aç" : "Kampanyayı kapat"}
          </Button>
        }
      />

      <StatGroup className="mb-(--gap)">
        <Stat>
          <StatLabel>Toplanan</StatLabel>
          <StatValue>{fmtTL(total)}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Hedef</StatLabel>
          <StatValue>{c.target ? fmtTL(c.target) : "—"}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Katkı veren</StatLabel>
          <StatValue>{countOf(id)}</StatValue>
        </Stat>
      </StatGroup>

      {pct !== null ? (
        <div className="mb-(--gap) grid gap-1">
          <Progress value={pct} tone={pct >= 100 ? "success" : "accent"} />
          <div className="flex justify-between text-xs text-fg-muted tabular-nums">
            <span>%{pct}</span>
            <span>
              {fmtTL(total)} / {fmtTL(c.target!)}
            </span>
          </div>
        </div>
      ) : null}

      <Tabs defaultValue="katkilar">
        <TabsList>
          <TabsTrigger value="katkilar" count={countOf(id)}>
            Katkılar
          </TabsTrigger>
          <TabsTrigger value="hikaye">Hikaye &amp; ayar</TabsTrigger>
        </TabsList>

        {/* ---- Katkı editörü ---- */}
        <TabsContent value="katkilar">
          <Card>
            <CardHeader
              title="Kim ne kadar verdi"
              description="Her üyenin katkısını gir — değişiklik anında kaydedilir. Boş/0 bırakılan katkı sayılmaz."
              action={
                <div className="flex items-center gap-3">
                  <Switch label="Sadece verenler" labelPosition="start" checked={onlyGivers} onCheckedChange={setOnlyGivers} />
                </div>
              }
            />
            <CardBody className="grid gap-3">
              <Input placeholder="İsim ara…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />

              <div className="max-h-[52vh] divide-y divide-line overflow-auto rounded-ui-sm border border-line">
                {rows.length === 0 ? (
                  <EmptyState kind="no-results" size="sm" title="Kayıt yok" description="Aramanı değiştir ya da filtreyi kaldır." />
                ) : (
                  rows.map((m) => {
                    const amt = contributionOf(id, m.key);
                    return (
                      <div key={m.key} className="flex items-center gap-3 px-3 py-2 hover:bg-hover">
                        <Avatar size="sm" name={titlecase(m.name)} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{titlecase(m.name)}</div>
                          {amt > 0 ? <div className="truncate text-xs text-accent-ink tabular-nums">{fmtTL(amt)}</div> : null}
                        </div>
                        <CurrencyInput
                          currency="TRY"
                          aria-label={`${titlecase(m.name)} katkısı`}
                          className="w-36"
                          value={amt > 0 ? String(amt) : null}
                          onValueChange={(v) => setContribution(id, m.key, v ? Number(v) : 0)}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </CardBody>
            <CardFooter className="justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
                <Users className="size-4" /> {countOf(id)} kişi katkı verdi
              </span>
              <span className="font-semibold tabular-nums">Toplam {fmtTL(total)}</span>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---- Hikaye & ayar ---- */}
        <TabsContent value="hikaye">
          <Card className="mb-(--gap)">
            <CardHeader title="Kampanya bilgisi" description="Başlık, tür, hikaye ve hedef. Değişiklik anında kaydedilir." />
            <CardBody className="grid gap-3">
              <Field label="Başlık">
                <Input value={c.title} onChange={(e) => update(id, { title: e.target.value })} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Tür">
                  <NativeSelect
                    value={c.type}
                    onChange={(e) => update(id, { type: e.target.value as CampaignType })}
                    items={CAMPAIGN_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                  />
                </Field>
                <Field label="Hedef tutar (opsiyonel)">
                  <CurrencyInput
                    currency="TRY"
                    value={c.target ? String(c.target) : null}
                    onValueChange={(v) => update(id, { target: v ? Number(v) : undefined })}
                  />
                </Field>
              </div>
              <Field label="Hikaye">
                <Textarea rows={5} value={c.story} onChange={(e) => update(id, { story: e.target.value })} placeholder="Ne için toplanıyor, neden önemli…" />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Tehlikeli alan" description="Bu kampanyayı ve tüm katkı kayıtlarını kalıcı olarak siler." />
            <CardFooter className="justify-end">
              <Button variant="danger" onClick={del}>
                <Trash2 /> Kampanyayı sil
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
