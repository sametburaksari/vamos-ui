"use client";

import * as React from "react";
import { Button, EmptyState, Sheet, SheetContent, Toaster, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../_shared/format";
import { orders as initialOrders, type Order } from "../_shared/orders";
import { minutesFromNow } from "../_shared/time";
import { storeNav, storefronts } from "./data";
import { StoreTopNav } from "./components/top-nav";
import { OrdersPage, tabFilter } from "./components/orders-page";
import { OrderSheetBody } from "./components/order-sheet";

/**
 * E-commerce admin shell: the store's sections in a top bar, the active section's views as
 * sub-tabs underneath, and a breadcrumb on the page. Shown with the order queue: tab counts
 * that follow the data, search, bulk fulfilment with undo and an order preview sheet.
 */
export default function Shell07() {
  const { c, t } = useBlockFormat();
  const [section, setSection] = React.useState("orders");
  const [tab, setTab] = React.useState("unfulfilled");
  const [store, setStore] = React.useState("online");
  const [list, setList] = React.useState<Order[]>(initialOrders);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [openId, setOpenId] = React.useState<string | null>(null);

  const current = storeNav.find((s) => s.id === section)!;
  const subTab = current.tabs.find((x) => x.id === tab) ?? current.tabs[0]!;
  const opened = list.find((o) => o.id === openId) ?? null;

  const counts = React.useMemo<Record<string, number>>(() => {
    if (section !== "orders") return {} as Record<string, number>;
    return { unfulfilled: list.filter(tabFilter.unfulfilled!).length, unpaid: list.filter(tabFilter.unpaid!).length };
  }, [list, section]);

  const navigate = (s: string, tb?: string) => {
    setSection(s);
    setTab(tb ?? storeNav.find((x) => x.id === s)!.tabs[s === "orders" ? 1 : 0]!.id);
    setSelected(new Set());
  };

  // Optimistic: orders leave the queue at once; Undo puts them back.
  const ship = (ids: string[], carrier?: string, tracking?: string) => {
    const before = list;
    const at = minutesFromNow(0);
    setList((l) =>
      l.map((o) =>
        ids.includes(o.id)
          ? {
              ...o,
              status: "shipped",
              carrier: carrier ?? "Kırlangıç Kargo",
              tracking: tracking || `KL${String(73010000 + Number(o.id.slice(2))).padStart(10, "0")}`,
              steps: [...o.steps.filter((s) => s.step !== "shipped"), ...(o.steps.some((s) => s.step === "picked") ? [] : [{ step: "picked" as const, at }]), ...(o.steps.some((s) => s.step === "packed") ? [] : [{ step: "packed" as const, at }]), { step: "shipped" as const, at }],
            }
          : o,
      ),
    );
    setSelected(new Set());
    toast.success(c(`${ids.length} ${ids.length === 1 ? "order" : "orders"} marked as fulfilled`, `${ids.length} sipariş gönderildi olarak işaretlendi`), {
      description: c("Customers get the shipping email in a minute.", "Müşterilere kargo e-postası bir dakika içinde gider."),
      action: { label: c("Undo", "Geri al"), onClick: () => setList(before) },
    });
  };

  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <StoreTopNav
        section={section}
        tab={subTab.id}
        onNavigate={navigate}
        store={store}
        onStoreChange={(id) => {
          setStore(id);
          toast(c(`Switched to ${t(storefronts.find((s) => s.id === id)!.name)}`, `${t(storefronts.find((s) => s.id === id)!.name)} kanalına geçildi`));
        }}
        counts={counts}
      />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">
        {section === "orders" ? (
          <OrdersPage
            key={subTab.id}
            tab={subTab}
            sectionLabel={t(current.label)}
            orders={list}
            selected={selected}
            onSelectedChange={setSelected}
            onOpen={(o) => setOpenId(o.id)}
            onFulfil={(ids) => ship(ids)}
            onBack={() => navigate("orders", "unfulfilled")}
          />
        ) : (
          <EmptyState
            size="lg"
            title={`${t(current.label)} · ${t(subTab.label)}`}
            description={c("This view isn't part of the preview. The section bar and sub-tabs work the same everywhere.", "Bu görünüm önizlemeye dahil değil. Bölüm çubuğu ve alt sekmeler her yerde aynı çalışır.")}
            actions={<Button onClick={() => navigate("orders", "unfulfilled")}>{c("Back to orders", "Siparişlere dön")}</Button>}
          />
        )}
      </main>

      <Sheet open={!!opened} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="end" size="md">
          {opened ? (
            <OrderSheetBody
              key={opened.id}
              order={opened}
              onFulfil={(id, carrier, tracking) => {
                ship([id], carrier, tracking);
                setOpenId(null);
              }}
            />
          ) : null}
        </SheetContent>
      </Sheet>
      <Toaster />
    </div>
  );
}
