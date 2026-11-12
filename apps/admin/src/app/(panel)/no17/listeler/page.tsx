"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Trash2, Users } from "lucide-react";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  ItemList,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMeta,
  ItemActions,
  IconButton,
  EmptyState,
} from "@vamos-cms/ui";
import { useLists } from "@/lib/no17-lists";

export default function No17Lists() {
  const { lists, remove } = useLists();

  const fmtDate = (t: number) =>
    new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(t);

  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        eyebrow="NO:17"
        title="Listeler"
        description="Mevcut üyelerden oluşturduğun listeler. Excel'e aktar veya yazdır."
        actions={
          <Button asChild variant="solid">
            <Link href="/no17/listeler/yeni">
              <Plus /> Yeni liste
            </Link>
          </Button>
        }
      />

      {lists.length === 0 ? (
        <Card className="ui-rise">
          <EmptyState
            icon={<Users />}
            title="Henüz liste yok"
            description="Deplasman kadrosu, otobüs listesi, kombineliler… Mevcut üyelerden tek tıkla oluştur."
            actions={
              <Button asChild variant="solid">
                <Link href="/no17/listeler/yeni">
                  <Plus /> İlk listeyi oluştur
                </Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="ui-rise">
          <ItemList>
            {lists.map((l) => (
              <Item key={l.id} asChild>
                <Link href={`/no17/listeler/${l.id}`}>
                  <ItemContent>
                    <ItemTitle>{l.name}</ItemTitle>
                    <ItemDescription>
                      {fmtDate(l.createdAt)}
                      {l.note ? ` · ${l.note}` : ""}
                    </ItemDescription>
                  </ItemContent>
                  <ItemMeta>
                    <Badge tone="accent">{l.keys.length} kişi</Badge>
                  </ItemMeta>
                  <ItemActions>
                    <IconButton
                      size="xs"
                      label="Listeyi sil"
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm(`"${l.name}" listesi silinsin mi?`)) remove(l.id);
                      }}
                    >
                      <Trash2 />
                    </IconButton>
                  </ItemActions>
                </Link>
              </Item>
            ))}
          </ItemList>
        </Card>
      )}
    </div>
  );
}
