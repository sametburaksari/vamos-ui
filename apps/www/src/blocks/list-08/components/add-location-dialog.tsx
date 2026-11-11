"use client";

import * as React from "react";
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Input, RadioGroup, Select } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { me } from "../../_shared/people";
import { districts, kindLabels, type Location, type LocationKind } from "./locations-data";

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextNo: string;
  onAdd: (location: Location) => void;
}

/** New location: name, kind and district. It lands on the district centre until someone moves the pin. */
export function AddLocationDialog({ open, onOpenChange, nextNo, onAdd }: AddLocationDialogProps) {
  const { c, t } = useBlockFormat();
  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState<LocationKind>("pickup");
  const [district, setDistrict] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName("");
      setKind("pickup");
      setDistrict(null);
      setTried(false);
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    const d = districts.find((x) => x.name === district);
    if (!name.trim() || !d) return;
    onAdd({
      id: `st-new-${nextNo}`,
      no: nextNo,
      name: name.trim(),
      district: d.name,
      lat: d.lat,
      lng: d.lng,
      kind,
      metric: 0,
      open: true,
      street: c("Address to be confirmed", "Adres teyit edilecek"),
      phone: "+90 216 000 00 50",
      managerId: me.id,
      hours: kind === "warehouse" ? { open: "06:00", close: "23:00" } : { open: "10:00", close: "21:00" },
      staff: { on: 0, planned: 0 },
      trend: Array(14).fill(0),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader
          title={c("Add location", "Lokasyon ekle")}
          description={c(`It gets number ${nextNo} on the list and the map.`, `Listede ve haritada ${nextNo} numarasını alır.`)}
        />
        <form onSubmit={submit} noValidate>
          <DialogBody className="grid gap-4">
            <Field label={c("Name", "Ad")} required error={tried && !name.trim() ? c("Give the location a name.", "Lokasyona bir ad verin.") : undefined}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={c("Pickup point Levent", "Teslim noktası Levent")} data-autofocus />
            </Field>
            <Field label={c("Kind", "Tür")}>
              <RadioGroup
                variant="segmented"
                value={kind}
                onValueChange={(v) => setKind(v as LocationKind)}
                items={(["store", "pickup", "warehouse"] as const).map((k) => ({
                  value: k,
                  label: t(kindLabels[k]),
                }))}
              />
            </Field>
            <Field label={c("District", "İlçe")} required error={tried && !district ? c("Choose a district.", "Bir ilçe seçin.") : undefined}>
              <Select value={district} onValueChange={setDistrict} placeholder={c("Choose…", "Seçin…")} items={districts.map((d) => ({ value: d.name, label: d.name }))} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary">
              {c("Add location", "Lokasyon ekle")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
