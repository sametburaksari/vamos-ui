"use client";

import { Building2, KeyRound, LayoutDashboard } from "lucide-react";
import { useBlockFormat } from "../../_shared/format";

/** Side panel: the three hops of an SSO sign-in, drawn as a vertical route. */
export function HowItWorks() {
  const { c } = useBlockFormat();
  const hops = [
    { icon: <Building2 aria-hidden />, title: c("We find your organisation", "Kurumunuzu buluruz"), body: c("From the domain of your work email.", "İş e-postanızın alan adından.") },
    { icon: <KeyRound aria-hidden />, title: c("You sign in at your company", "Şirketinizde giriş yaparsınız"), body: c("With the password and 2FA your IT team already manages.", "BT ekibinizin yönettiği parola ve 2FA ile.") },
    { icon: <LayoutDashboard aria-hidden />, title: c("You land in Kiln & Linen", "Kiln & Linen’e ulaşırsınız"), body: c("Access follows your groups — leavers lose it the same day.", "Erişim gruplarınıza göre verilir — ayrılanlar aynı gün kaybeder.") },
  ];
  return (
    <aside aria-label={c("How single sign-on works", "Tek oturum açma nasıl çalışır")} className="surface-nav relative hidden overflow-hidden rounded-ui-lg p-8 lg:flex lg:flex-col lg:justify-between">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-nav-fg/60">{c("Single sign-on", "Tek oturum açma")}</p>
      <ol className="relative my-10 grid gap-9">
        <span aria-hidden className="absolute bottom-6 start-[1.2rem] top-6 border-s border-dashed border-nav-line" />
        {hops.map((h, i) => (
          <li key={h.title} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4">
            <span className="relative grid size-10 place-items-center rounded-full border border-nav-line bg-nav text-nav-fg-strong [&_svg]:size-[18px]">{h.icon}</span>
            <div>
              <p className="font-mono text-[11px] text-nav-fg/60">0{i + 1}</p>
              <p className="text-[15px] font-medium text-nav-fg-strong">{h.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-nav-fg/75">{h.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="max-w-[22rem] font-display text-[length:calc(22px*var(--display-scale))] leading-[1.25] text-nav-fg-strong">
        {c("One company login. No extra password to forget.", "Tek şirket girişi. Unutulacak ek parola yok.")}
      </p>
    </aside>
  );
}
