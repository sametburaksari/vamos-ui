// Contact import fixtures: the fields a contact has, a sample export from a previous CRM (Turkish
// headers, semicolons, day-first dates — the usual Excel export here) and recent import history.
import type { ImportCellMessages, ImportField } from "@vamos-ui/react/business";
import type { L } from "../../_shared/l10n";
import { day } from "../../_shared/time";

type Copy = (en: string, tr: string) => string;

/** Contact fields in the current language. Aliases cover English and Turkish export headers. */
export function contactFields(c: Copy): ImportField[] {
  return [
    { id: "firstName", label: c("First name", "Ad"), type: "text", required: true, aliases: ["first name", "given name", "ad", "isim"], example: "Elif" },
    { id: "lastName", label: c("Last name", "Soyad"), type: "text", required: true, aliases: ["last name", "surname", "soyad", "soyadı"], example: "Sönmez" },
    { id: "email", label: c("Email", "E-posta"), type: "email", required: true, aliases: ["e-mail", "email address", "e-posta", "eposta", "mail"], example: "elif@halcyon.example.com" },
    { id: "phone", label: c("Phone", "Telefon"), type: "phone", aliases: ["mobile", "gsm", "telefon", "cep"], example: "+90 216 000 00 14" },
    { id: "company", label: c("Company", "Şirket"), type: "text", aliases: ["organisation", "organization", "firma", "şirket"], example: "Halcyon Ferments" },
    {
      id: "stage",
      label: c("Lifecycle stage", "Aşama"),
      type: "enum",
      aliases: ["lifecycle", "status", "aşama", "durum"],
      example: c("Lead, Customer or Partner", "Aday, Müşteri veya İş ortağı"),
      options: [
        { value: "lead", label: c("Lead", "Aday"), aliases: ["lead", "aday", "prospect"] },
        { value: "customer", label: c("Customer", "Müşteri"), aliases: ["customer", "müşteri", "client"] },
        { value: "partner", label: c("Partner", "İş ortağı"), aliases: ["partner", "iş ortağı", "bayi"] },
      ],
    },
    { id: "since", label: c("Customer since", "Kayıt tarihi"), type: "date", aliases: ["created", "created on", "kayıt tarihi", "tarih"], example: "14.03.2025" },
    { id: "consent", label: c("Marketing consent", "Pazarlama izni"), type: "boolean", aliases: ["opt-in", "consent", "izin", "iys"], example: c("yes / no", "evet / hayır") },
  ];
}

export function cellMessages(c: Copy): ImportCellMessages {
  return {
    number: c("Not a number", "Sayı değil"),
    date: c("Not a date (use DD.MM.YYYY)", "Tarih değil (GG.AA.YYYY kullanın)"),
    boolean: c("Use yes or no", "Evet ya da hayır yazın"),
    enum: c("Not one of: {options}", "Şunlardan biri olmalı: {options}"),
    email: c("Not an email address", "E-posta adresi değil"),
    phone: c("Not a phone number", "Telefon numarası değil"),
    iban: c("IBAN check digits don't match", "IBAN kontrol hanesi tutmuyor"),
    required: c("Required", "Zorunlu"),
    duplicate: c("Duplicate of row {row}", "{row}. satırın tekrarı"),
  };
}

/** What a previous CRM exports: 14 contacts, five of them with something to fix. */
export const sampleCsv = [
  "Ad;Soyad;E-posta;Telefon;Firma;Aşama;Kayıt tarihi;İzin;Not",
  "Elif;Sönmez;elif.sonmez@halcyon.example.com;+90 216 000 00 14;Halcyon Ferments;Müşteri;14.03.2025;evet;Prefers WhatsApp",
  "Tomas;Brandt;tomas@tidewell.example.com;+90 216 000 00 22;Tidewell Logistics;Customer;02.06.2024;yes;",
  "Aslı;Karaca;asli.karaca@velvetanchor.example.com;0216 000 00 31;Velvet Anchor Hotels;Aday;21.10.2026;hayır;Met at the trade fair",
  "Mert;Erden;mert.erden@;+90 216 000 00 38;Orchard & Oak Furniture;Lead;05.09.2026;evet;",
  "Sofia;Marchetti;sofia@paperlantern.example.com;+90 216 000 00 41;Paper Lantern Studio;Partner;11.01.2023;yes;Reseller, Izmir",
  "Burak;Tunç;burak.tunc@northfield.example.com;+90 216 000 00 47;Northfield Bakery;Müşteri;30.07.2025;evet;",
  "Leyla;;leyla@quaymarket.example.com;+90 216 000 00 52;Quay Market;Aday;18.08.2026;hayır;",
  "Jonas;Weber;jonas.weber@saltbox.example.com;+90 216 000 00 55;Saltbox Coffee;Customer;03.12.2024;no;",
  "Derya;Aksu;derya@mosaicyoga.example.com;+90 216 000 00 61;Mosaic Yoga;VIP;27.04.2025;evet;Ask about wholesale",
  "Hugo;Lefèvre;hugo@lumenoptics.example.com;+90 216 000 00 66;Lumen Optics;Partner;09.02.2024;yes;",
  "Ece;Yalın;ece.yalin@cedarline.example.com;+90 216 000 00 72;Cedarline Dental;Müşteri;31.02.2025;evet;",
  "Tomas;Brandt;tomas@tidewell.example.com;+90 216 000 00 22;Tidewell Logistics;Customer;02.06.2024;yes;Duplicate from old list",
  "Nil;Oral;nil.oral@bluegate.example.com;+90 216 000 00 79;Bluegate Travel;Aday;12.11.2026;evet;",
  "Kaan;Demir;kaan@ironleaf.example.com;+90 216 000 00 84;Ironleaf Garden;Lead;06.11.2026;hayır;",
].join("\r\n");

export const sampleFileName = "contacts-export-2026-11.csv";

/** The empty template people can download and fill in. */
export const templateCsv = "First name,Last name,Email,Phone,Company,Lifecycle stage,Customer since,Marketing consent\r\nElif,Sönmez,elif@halcyon.example.com,+90 216 000 00 14,Halcyon Ferments,Customer,14.03.2025,yes\r\n";

export interface PastImport {
  id: string;
  file: string;
  date: string;
  rows: number;
  failed: number;
  by: string;
  status: "done" | "partial";
}

export const pastImports: PastImport[] = [
  { id: "imp-3", file: "fair-leads-oct.xlsx", date: day(-21), rows: 86, failed: 0, by: "p-aylin", status: "done" },
  { id: "imp-2", file: "wholesale-partners.csv", date: day(-48), rows: 24, failed: 3, by: "p-noah", status: "partial" },
  { id: "imp-1", file: "newsletter-2025.csv", date: day(-112), rows: 412, failed: 0, by: "p-defne", status: "done" },
];

export const strategyNotes: Record<"skip" | "update" | "create", L> = {
  skip: { en: "Existing contacts stay as they are.", tr: "Mevcut kişiler olduğu gibi kalır." },
  update: { en: "Matching contacts take the file's values.", tr: "Eşleşen kişiler dosyadaki değerleri alır." },
  create: { en: "Every row becomes a new contact.", tr: "Her satır yeni bir kişi olur." },
};
