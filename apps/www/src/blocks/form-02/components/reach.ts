import { multiplyDecimal } from "../../_shared/money";
import { cities, consent, segments, smsSegments, type CampaignDraft } from "./data";

/** Estimated recipients and cost for the current draft. Pure, so the preview and review agree. */
export function estimate(d: CampaignDraft) {
  const seg = segments.find((s) => s.id === d.segment);
  const cityShare = cities.filter((c) => d.cities.includes(c.id)).reduce((n, c) => n + c.share, 0);
  const matched = seg ? Math.round(seg.size * cityShare) : 0;
  const afterExclusions = Math.round(matched * (d.excludeRecentBuyers && seg?.id !== "recent" ? 0.93 : 1) * (d.excludeFatigued ? 0.96 : 1));
  const reach = Math.round(afterExclusions * consent[d.channel]);
  const parts = d.channel === "sms" ? smsSegments(d.sms).count : 1;
  const unit = d.channel === "email" ? "0.02" : d.channel === "sms" ? "0.32" : "0";
  const cost = multiplyDecimal(unit, String(reach * parts));
  const opens = seg ? Math.round(reach * (d.channel === "sms" ? 0.9 : seg.engaged + (d.channel === "push" ? -0.08 : 0.12))) : 0;
  return { seg, matched, afterExclusions, reach, parts, cost, opens };
}
