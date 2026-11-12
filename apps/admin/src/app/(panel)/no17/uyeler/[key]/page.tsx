"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Phone, MessageCircle } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Avatar,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DescriptionList,
  EmptyState,
  Switch,
} from "@vamos-cms/ui";
import { titlecase, maskTc, fmtPhone, bloodTone, hasBlood, matchSubtitle, fmtTL, campaignTone } from "@/lib/no17-helpers";
import { FIXTURE } from "@/lib/no17-data";
import { useAttendance } from "@/lib/no17-store";
import { useCampaigns, campaignTypeLabel } from "@/lib/no17-campaigns";
import { useMemberFull } from "@/lib/no17-sensitive";

export default function No17MemberProfile() {
  const params = useParams<{ key: string }>();
  const key = decodeURIComponent(params.key);
  const member = useMemberFull(key);
  const { isGoing, set, matchesForMember } = useAttendance();
  const { contributionsForMember, memberTotal } = useCampaigns();

  if (!member) {
    return (
      <div className="mx-auto max-w-[1280px]">
        <PageHeader back={{ href: "/no17/uyeler", label: "Üyeler" }} title="Üye bulunamadı" />
        <EmptyState title="Bu üye yok" description="Aradığın kayıt silinmiş ya da bağlantı hatalı olabilir." />
      </div>
    );
  }

  const goingCount = matchesForMember(key).length;
  const donations = contributionsForMember(key);
  const donationTotal = memberTotal(key);
  const name = titlecase(member.name);

  const facts = [
    { key: "name", label: "Ad Soyad", value: name },
    { key: "tc", label: "T.C. Kimlik No", value: maskTc(member.tc), copyable: member.tc || (false as const), hint: member.tc ? "Kopyala → tam numara" : undefined },
    { key: "phone", label: "Telefon", value: fmtPhone(member.phone), copyable: member.phone || (false as const) },
    { key: "blood", label: "Kan grubu", value: hasBlood(member.blood) ? member.blood : undefined },
    { key: "bday", label: "Doğum günü", value: member.bday || undefined },
    { key: "uye", label: "Durum", value: member.uye ? "Üye" : "Form kaydı" },
    { key: "kombine", label: "Kombine", value: member.kombine ? "Var" : "Yok" },
  ];

  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        back={{ href: "/no17/uyeler", label: "Üyeler" }}
        title={
          <span className="inline-flex items-center gap-3">
            <Avatar size="lg" name={name} />
            {name}
          </span>
        }
        description={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Badge tone={member.uye ? "success" : "neutral"}>{member.uye ? "Üye" : "Form"}</Badge>
            {member.kombine ? (
              <Badge tone="accent" dot>
                Kombine
              </Badge>
            ) : null}
            {hasBlood(member.blood) ? <Badge tone={bloodTone(member.blood)}>{member.blood}</Badge> : null}
            <Badge tone="info">{goingCount} maça işaretli</Badge>
            {donationTotal > 0 ? <Badge tone="accent">{fmtTL(donationTotal)} bağış</Badge> : null}
          </span>
        }
        actions={
          member.phone ? (
            <>
              <Button asChild variant="secondary">
                <a href={`tel:+9${member.phone}`}>
                  <Phone /> Ara
                </a>
              </Button>
              <Button asChild variant="solid">
                <a href={`https://wa.me/9${member.phone}`} target="_blank" rel="noreferrer">
                  <MessageCircle /> WhatsApp
                </a>
              </Button>
            </>
          ) : undefined
        }
      />

      <Tabs defaultValue="genel">
        <TabsList>
          <TabsTrigger value="genel">Genel</TabsTrigger>
          <TabsTrigger value="katilim" count={goingCount}>
            Katılım
          </TabsTrigger>
          <TabsTrigger value="bagis" count={donations.length}>
            Bağış
          </TabsTrigger>
          <TabsTrigger value="iletisim">İletişim</TabsTrigger>
        </TabsList>

        <TabsContent value="genel">
          <Card>
            <CardHeader title="Kimlik &amp; üyelik" description="Grup üyelik formundan gelen bilgiler." />
            <CardBody>
              <DescriptionList items={facts} />
            </CardBody>
          </Card>
        </TabsContent>

        <TabsContent value="katilim">
          <Card>
            <CardHeader
              title="Maç katılımı"
              description="Bu kişiyi maçlara işaretle/çıkar. Değişiklik anında kaydedilir."
            />
            <CardBody className="grid gap-1">
              {FIXTURE.map((f) => (
                <Switch
                  key={f.id}
                  labelPosition="start"
                  label={f.opp}
                  description={matchSubtitle(f)}
                  checked={isGoing(f.id, key)}
                  onCheckedChange={(v) => set(f.id, key, v)}
                />
              ))}
            </CardBody>
          </Card>
        </TabsContent>

        <TabsContent value="bagis">
          <Card>
            <CardHeader
              title="Bağış katkıları"
              description="Bu üyenin köy okulu, pankart, cenaze/vefa gibi kampanyalara verdiği katkılar."
              action={donationTotal > 0 ? <span className="font-semibold tabular-nums">Toplam {fmtTL(donationTotal)}</span> : undefined}
            />
            <CardBody>
              {donations.length === 0 ? (
                <EmptyState kind="first-use" size="sm" title="Henüz katkı yok" description="Bu üyenin kaydedilmiş bir bağış katkısı yok. Katkı girmek için kampanya sayfasını aç." />
              ) : (
                <div className="divide-y divide-line rounded-ui-sm border border-line">
                  {donations.map(({ campaign, amount }) => (
                    <Link
                      key={campaign.id}
                      href={`/no17/bagis/${campaign.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-hover"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{campaign.title}</div>
                        <div className="mt-0.5">
                          <Badge tone={campaignTone(campaign.type)}>{campaignTypeLabel(campaign.type)}</Badge>
                        </div>
                      </div>
                      <span className="font-semibold tabular-nums text-accent-ink">{fmtTL(amount)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </TabsContent>

        <TabsContent value="iletisim">
          <Card>
            <CardHeader title="İletişim" />
            <CardBody>
              {member.phone ? (
                <DescriptionList
                  items={[
                    { key: "phone", label: "Telefon", value: fmtPhone(member.phone), copyable: member.phone },
                    { key: "wa", label: "WhatsApp", value: <Link href={`https://wa.me/9${member.phone}`}>wa.me/9{member.phone}</Link> },
                  ]}
                />
              ) : (
                <EmptyState title="Telefon kayıtlı değil" description="Bu üye için iletişim numarası girilmemiş." />
              )}
            </CardBody>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
