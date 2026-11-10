import type { FooterProps } from "@vamos-cms/ui/blocks";

export const studioFooter: FooterProps = {
  brand: { name: "Vamos", href: "/" },
  about: "A small studio in Maltepe building websites, booking systems and ad campaigns for restaurants, spas and clinics.",
  columns: [
    { title: "Studio", links: [{ href: "/work", label: "Work" }, { href: "/services", label: "Services" }, { href: "/journal", label: "Journal" }, { href: "/about", label: "About" }] },
    { title: "Products", links: [{ href: "/vtag", label: "vTag" }, { href: "/vrest", label: "vRest" }, { href: "/vmob", label: "vMob" }] },
    { title: "Help", links: [{ href: "/contact", label: "Contact" }, { href: "/faq", label: "FAQ" }, { href: "https://status.vamos.ist", label: "Status", newTab: true }] },
  ],
  contact: { phone: "+902168072907", email: "hello@vamos.ist", address: { line: "Piazza AVM, Office Link", district: "Cevizli", city: "Maltepe", postalCode: "34846", country: "TR" } },
  social: [
    { network: "instagram", href: "https://instagram.com/vamos.ist" },
    { network: "linkedin", href: "https://linkedin.com/company/vamos-ist" },
    { network: "youtube", href: "https://youtube.com/@vamosist" },
  ],
  legalLinks: [{ href: "/privacy", label: "Privacy" }, { href: "/kvkk", label: "KVKK notice" }, { href: "/terms", label: "Terms" }],
  year: 2026,
};

/** A restaurant on Bağdat Caddesi: menu, bookings and visit columns. */
export const restaurantFooter: FooterProps = {
  ...studioFooter,
  brand: { name: "Kıyı Meyhane" },
  about: "Meze, fish and rakı on Bağdat Caddesi since 2014.",
  columns: [
    { title: "Eat", links: [{ href: "/menu", label: "Tonight’s menu" }, { href: "/wine", label: "Wine & rakı" }, { href: "/private-dining", label: "Private dining" }] },
    { title: "Visit", links: [{ href: "/book", label: "Book a table" }, { href: "/find-us", label: "Find us" }, { href: "/gift-cards", label: "Gift cards" }] },
    { title: "Help", links: [{ href: "/contact", label: "Contact" }, { href: "/allergens", label: "Allergens" }] },
  ],
  contact: { phone: "+902163581144", email: "masa@kiyimeyhane.com", address: { line: "Bağdat Caddesi 412", district: "Caddebostan", city: "Kadıköy", postalCode: "34728", country: "TR" } },
  social: [{ network: "instagram", href: "https://instagram.com/kiyimeyhane" }],
};

/** A hammam and spa in Moda: treatments, gift cards and visit columns. */
export const spaFooter: FooterProps = {
  ...studioFooter,
  brand: { name: "Hamam Moda" },
  about: "Hammam, massage and skin care in Moda. Gift cards delivered by email within minutes.",
  columns: [
    { title: "Treatments", links: [{ href: "/hammam", label: "Hammam rituals" }, { href: "/massage", label: "Massage" }, { href: "/facials", label: "Facials" }] },
    { title: "Shop", links: [{ href: "/gift-cards", label: "Gift cards" }, { href: "/packages", label: "Packages" }] },
    { title: "Visit", links: [{ href: "/book", label: "Book a treatment" }, { href: "/find-us", label: "Find us" }, { href: "/faq", label: "FAQ" }] },
  ],
  contact: { phone: "+902163470912", email: "rezervasyon@hamammoda.com", address: { line: "Moda Caddesi 88", district: "Moda", city: "Kadıköy", postalCode: "34710", country: "TR" } },
  social: [{ network: "instagram", href: "https://instagram.com/hamammoda" }],
};
