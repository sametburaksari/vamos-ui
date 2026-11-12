import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { memberContributions, memberAttendance } from "@/lib/no17-records.server";
import { MATCH_BY_ID } from "@/lib/no17-helpers";

/** Girişli üyenin kendi bağışları + katıldığı maçlar. */
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = await verifySession(token);
  if (!s) return NextResponse.json({ ok: false }, { status: 401 });

  const donations = memberContributions(s.key);
  const matches = memberAttendance(s.key).map((a) => {
    const f = MATCH_BY_ID[a.matchId];
    return {
      matchId: a.matchId,
      guests: a.guests,
      opp: f?.opp ?? a.matchId,
      date: f?.date ?? "",
      comp: f?.comp ?? "",
      ha: f?.ha ?? "İç",
    };
  });

  return NextResponse.json({ ok: true, donations, matches });
}
