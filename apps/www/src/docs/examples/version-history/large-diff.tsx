"use client";

import { DiffView } from "@vamos-ui/react";

const policy = Array.from({ length: 60 }, (_, i) => `${i + 1}. ${
  [
    "Employees accrue 1.75 days of paid leave per month.",
    "Leave requests are approved by the direct manager.",
    "Unused leave carries over until March 31.",
    "Sick leave requires a doctor's note after 2 days.",
    "Remote work is allowed up to 3 days per week.",
  ][i % 5]
}`);
const updated = [...policy];
updated[2] = "3. Unused leave carries over until April 30.";
updated[18] = "19. Sick leave requires a doctor's note after 3 days.";
updated.splice(41, 1, "42. Remote work is allowed up to 4 days per week.", "42a. Work from abroad is allowed for 20 days a year.");

export default function VersionHistoryLargeDiff() {
  return <DiffView className="w-full [--diff-max-h:24rem]" before={policy.join("\n")} after={updated.join("\n")} beforeLabel="Leave policy 2026" afterLabel="Leave policy 2027" context={2} />;
}
