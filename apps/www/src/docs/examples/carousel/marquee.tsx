import { Marquee } from "@vamos-cms/ui";

const customers = ["Atlas Lojistik", "Lena Spa", "Kalamış Bistro", "Kargo Hızlı", "Moda Sahne", "Pera Dental", "Bosphorus Yacht Co.", "Nişantaşı Optik"];

export default function CarouselMarquee() {
  return (
    <div className="w-full">
      <p className="mb-4 text-center text-[11px] font-medium tracking-[0.14em] text-fg-subtle uppercase">Trusted by 1,200 teams across Türkiye</p>
      <Marquee label="Customers" duration={36}>
        {customers.map((c) => (
          <span key={c} className="font-display text-xl whitespace-nowrap text-fg-muted">
            {c}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
