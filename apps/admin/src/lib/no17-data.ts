// NO:17 — client-safe veri şeması + kamuya açık fikstür.
// ÜYE ROSTER'ı (isim/doğum günü/kan grubu) ve PREFILL burada DEĞİL:
// kişisel olduğu için repoya girmez; derleme öncesi NO17_PRIVATE_B64 env'inden
// `no17-roster.generated.ts` üretilir (scripts/gen-no17-private.mjs). TC + telefon
// ise yalnızca sunucuda (no17-data.server.ts, MEMBER_PII_B64).
export type Member = {
  key: string; name: string; phone: string; tc: string;
  blood: string; bday: string; kombine: boolean; uye: boolean;
  /** Hassas değerler sunucuda; client yalnızca 'var mı' bilgisini görür. */
  hasTc?: boolean; hasPhone?: boolean;
};
export type Fixture = { id: string; date: string; opp: string; ha: "İç" | "Dep"; comp: string; score?: string };

export const FIXTURE: Fixture[] = [
  { id: "genclerbirligi", date: "15 Ağu", opp: "Gençlerbirliği", ha: "Dep", comp: "SL", score: "1-2" },
  { id: "konyaspor", date: "22 Ağu", opp: "Konyaspor", ha: "İç", comp: "SL", score: "4-2" },
  { id: "samsunspor", date: "30 Ağu", opp: "Samsunspor", ha: "Dep", comp: "SL", score: "2-0" },
  { id: "besiktas", date: "5 Eyl", opp: "Beşiktaş", ha: "İç", comp: "SL", score: "1-2" },
  { id: "roma", date: "10 Eyl", opp: "Roma", ha: "İç", comp: "ŞL", score: "1-1" },
  { id: "gaziantep", date: "14 Eyl", opp: "Gaziantep FK", ha: "Dep", comp: "SL", score: "0-0" },
  { id: "eyupspor", date: "20 Eyl", opp: "Eyüpspor", ha: "İç", comp: "SL", score: "8-0" },
  { id: "rizespor", date: "10 Eki", opp: "Çaykur Rizespor", ha: "Dep", comp: "SL", score: "3-0" },
  { id: "astonvilla", date: "14 Eki", opp: "Aston Villa", ha: "Dep", comp: "ŞL", score: "0-6" },
  { id: "alanyaspor", date: "17 Eki", opp: "Alanyaspor", ha: "İç", comp: "SL", score: "3-0" },
  { id: "slaviaprag", date: "20 Eki", opp: "Slavia Prag", ha: "İç", comp: "ŞL", score: "2-2" },
  { id: "galatasaray", date: "26 Eki", opp: "Galatasaray", ha: "Dep", comp: "SL", score: "1-2" },
  { id: "goztepe", date: "31 Eki", opp: "Göztepe", ha: "İç", comp: "SL", score: "1-2" },
  { id: "liverpool", date: "4 Kas", opp: "Liverpool", ha: "İç", comp: "ŞL", score: "3-2" },
  { id: "corum", date: "8 Kas", opp: "Çorum FK", ha: "Dep", comp: "SL" },
  { id: "realsociedad", date: "11 Kas", opp: "Real Sociedad (K)", ha: "İç", comp: "UWCL" },
  { id: "kocaeli", date: "22 Kas", opp: "Kocaelispor", ha: "Dep", comp: "SL" },
  { id: "shakhtar", date: "25 Kas", opp: "Shakhtar Donetsk", ha: "Dep", comp: "ŞL" },
  { id: "erzurum", date: "29 Kas", opp: "Erzurumspor", ha: "İç", comp: "SL" },
  { id: "basaksehir", date: "6 Ara", opp: "Başakşehir", ha: "Dep", comp: "SL" },
  { id: "lask", date: "9 Ara", opp: "LASK", ha: "Dep", comp: "ŞL" },
  { id: "trabzon", date: "13 Ara", opp: "Trabzonspor", ha: "İç", comp: "SL" },
  { id: "kasimpasa", date: "20 Ara", opp: "Kasımpaşa", ha: "Dep", comp: "SL" },
  { id: "villarreal", date: "20 Oca", opp: "Villarreal", ha: "İç", comp: "ŞL" },
  { id: "atletico", date: "27 Oca", opp: "Atletico Madrid", ha: "Dep", comp: "ŞL" },
];

// Kişisel roster + prefill: derleme öncesi env'den üretilir, repoya girmez.
export { MEMBERS, PREFILL } from "./no17-roster.generated";
