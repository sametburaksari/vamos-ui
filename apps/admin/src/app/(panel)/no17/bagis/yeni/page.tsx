"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Field,
  Input,
  Textarea,
  NativeSelect,
  CurrencyInput,
  Button,
} from "@vamos-cms/ui";
import { useCampaigns, CAMPAIGN_TYPES, type CampaignType } from "@/lib/no17-campaigns";

export default function No17NewCampaign() {
  const router = useRouter();
  const { create } = useCampaigns();

  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<CampaignType>("okul");
  const [story, setStory] = React.useState("");
  const [target, setTarget] = React.useState<string | null>(null);

  const save = () => {
    if (!title.trim()) return;
    const genId = create({
      title: title.trim(),
      type,
      story: story.trim(),
      target: target ? Number(target) : undefined,
    });
    router.push(`/no17/bagis/${genId}`);
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader
        back={{ href: "/no17/bagis", label: "Bağış" }}
        title="Yeni kampanya"
        description="Bir para toplama hikayesi aç: köy okulu, pankart, cenaze/vefa yardımı…"
      />

      <Card>
        <CardHeader title="Kampanya bilgisi" />
        <CardBody className="grid gap-3">
          <Field label="Başlık">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ör. Köy okulu — sıra & kırtasiye" autoFocus />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tür">
              <NativeSelect
                value={type}
                onChange={(e) => setType(e.target.value as CampaignType)}
                items={CAMPAIGN_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              />
            </Field>
            <Field label="Hedef tutar (opsiyonel)">
              <CurrencyInput currency="TRY" value={target} onValueChange={(v) => setTarget(v)} placeholder="₺0" />
            </Field>
          </div>
          <Field label="Hikaye">
            <Textarea rows={5} value={story} onChange={(e) => setStory(e.target.value)} placeholder="Ne için toplanıyor, neden önemli, nasıl ulaştırılacak…" />
          </Field>
        </CardBody>
        <CardFooter className="justify-end">
          <Button variant="solid" onClick={save} disabled={!title.trim()}>
            <Save /> Kampanyayı oluştur
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
