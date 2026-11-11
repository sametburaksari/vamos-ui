export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  stage: "Lead" | "Qualified" | "Customer";
}

export const contacts: Contact[] = [
  { id: "c1", name: "Ayşe Kaya", email: "ayse.kaya@northwind.io", company: "Northwind Traders", role: "Head of Sales", stage: "Customer" },
  { id: "c2", name: "Daniel Okafor", email: "daniel@brightpath.co", company: "Brightpath Clinics", role: "Operations Manager", stage: "Qualified" },
  { id: "c3", name: "Mara Fischer", email: "mara.fischer@kaltwasser.de", company: "Kaltwasser GmbH", role: "Procurement", stage: "Lead" },
  { id: "c4", name: "Marco Bianchi", email: "m.bianchi@osteria-luce.it", company: "Osteria Luce", role: "Owner", stage: "Customer" },
  { id: "c5", name: "Priya Raman", email: "priya@ledgerline.app", company: "Ledgerline", role: "CFO", stage: "Qualified" },
  { id: "c6", name: "Tom Hendricks", email: "tom@harborpine.com", company: "Harbor & Pine Dental", role: "Practice Manager", stage: "Customer" },
  { id: "c7", name: "Selin Arslan", email: "selin.arslan@moda-atelier.com", company: "Moda Atelier", role: "Marketing Lead", stage: "Lead" },
  { id: "c8", name: "James Whitfield", email: "j.whitfield@northwind.io", company: "Northwind Traders", role: "IT Director", stage: "Customer" },
];

export const stageTone = { Lead: "neutral", Qualified: "info", Customer: "success" } as const;

/** Edit distance, used for the "Did you mean" suggestion. */
function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length]!;
}

export const matches = (c: Contact, q: string) => {
  const n = q.trim().toLocaleLowerCase();
  return !n || [c.name, c.email, c.company, c.role].some((v) => v.toLocaleLowerCase().includes(n));
};

/** The closest company or person name, when the query is a likely typo. */
export function suggest(q: string): string | null {
  const n = q.trim().toLocaleLowerCase();
  if (n.length < 3) return null;
  let best: { word: string; d: number } | null = null;
  for (const c of contacts) {
    for (const full of [c.company, c.name]) {
      for (const word of [full, ...full.split(/\s+/)]) {
        const d = distance(n, word.toLocaleLowerCase());
        if (d > 0 && d <= Math.max(1, Math.floor(n.length / 4)) && (!best || d < best.d)) best = { word: full, d };
      }
    }
  }
  return best?.word ?? null;
}
