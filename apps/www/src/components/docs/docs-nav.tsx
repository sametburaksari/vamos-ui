"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@vamos-ui/react";
import { inventory } from "@/lib/catalog";
import { docSections } from "@/lib/site";

const heading = "mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle";

/** Docs sidebar: sections first, then every component group from the inventory. */
export function DocsNav() {
  const path = usePathname();
  const link = (href: string, label: React.ReactNode, extra?: React.ReactNode) => (
    <Link
      href={href}
      aria-current={path === href ? "page" : undefined}
      className={cn("flex items-center justify-between rounded-md px-2 py-1 text-fg hover:bg-hover", path === href && "bg-selected font-medium")}
    >
      {label}
      {extra}
    </Link>
  );

  return (
    <nav aria-label="Documentation" className="grid gap-6 text-[13px]">
      <div>
        <div className={heading}>Sections</div>
        <ul className="grid gap-px">{docSections.map((s) => <li key={s.href}>{link(s.href, s.label)}</li>)}</ul>
      </div>
      <div>
        <div className={heading}>Components</div>
        <ul className="grid gap-px"><li>{link("/docs/components", "All components")}</li></ul>
      </div>
      {inventory.map((g) => (
        <div key={g.group}>
          <div className={heading}>{g.group}</div>
          <ul className="grid gap-px">
            {g.items.map((i) => {
              if (i.slug && !i.slug.includes("#")) {
                return <li key={i.name}>{link(`/docs/components/${i.slug}`, i.name, null)}</li>;
              }
              if (i.slug) {
                const [base, hash] = i.slug.split("#");
                return (
                  <li key={i.name}>
                    <Link href={`/docs/components/${base}#${hash}`} className="block rounded-md px-2 py-1 text-fg-muted hover:bg-hover hover:text-fg">{i.name}</Link>
                  </li>
                );
              }
              return (
                <li key={i.name} className="flex items-center justify-between px-2 py-1 text-fg-subtle/80">
                  <span className="truncate">{i.name}</span>
                  {i.status === "next" && <span className="text-[10px]">next</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
