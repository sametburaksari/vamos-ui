// A pending team invite. Inviter and team come from the shared people fixtures; the invitee is
// new to the company, so they are defined here.
import { day, person, teamLabels, teamOf, workspaces, type L } from "../../_shared";

const inviter = person("p-kerem");

export const invite = {
  workspace: workspaces[0]!,
  inviter,
  role: { en: "Support Specialist", tr: "Destek Uzmanı" } as L,
  team: teamLabels.support,
  teammates: teamOf("support"),
  email: "mert.aral@example.com",
  suggestedName: "Mert Aral",
  sent: day(-1),
  expires: day(6),
  note: {
    en: "Welcome aboard! Your first week is shadowing the returns queue with me — see you Monday at 09:30.",
    tr: "Aramıza hoş geldin! İlk haftan benimle iade kuyruğunu izleyerek geçecek — pazartesi 09:30’da görüşürüz.",
  } as L,
  access: [
    { en: "Support inbox and returns queue", tr: "Destek gelen kutusu ve iade kuyruğu" },
    { en: "Orders and customers (view only)", tr: "Siparişler ve müşteriler (yalnızca görüntüleme)" },
    { en: "Refunds up to ₺2,500 without approval", tr: "Onaysız ₺2.500’e kadar iade" },
  ] as L[],
};

/** Demo account that "already exists" for the sign-in path. */
export const existingAccount = { email: "mert.aral@example.com" };

export const passwordRules: Array<{ id: string; label: L; test: (pw: string, name: string) => boolean }> = [
  { id: "len", label: { en: "At least 12 characters", tr: "En az 12 karakter" }, test: (pw) => pw.length >= 12 },
  { id: "mix", label: { en: "A number or a symbol", tr: "Bir rakam veya sembol" }, test: (pw) => /[\d\W_]/.test(pw) },
  {
    id: "name",
    label: { en: "Doesn’t contain your name", tr: "Adınızı içermiyor" },
    test: (pw, name) => {
      const parts = name.toLowerCase().split(/\s+/).filter((p) => p.length > 2);
      return pw.length > 0 && !parts.some((p) => pw.toLowerCase().includes(p));
    },
  },
];
