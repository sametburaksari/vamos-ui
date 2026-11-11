import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Booking agenda",
  description:
    "Meeting-room bookings for a coworking space as an agenda: one section per day under a sticky heading with its booking count and hours, a now line, rooms in colour, visitors and extras, check in / confirm / cancel with undo, details in a side sheet and a new-booking dialog that refuses overlapping slots. A month calendar jumps to a day and shows today's load per room.",
  category: "List pages",
  order: 60,
  tags: ["ops"],
  files: [
    "list-06/page.tsx",
    "list-06/components/agenda-view.tsx",
    "list-06/components/agenda-day.tsx",
    "list-06/components/booking-sheet.tsx",
    "list-06/components/new-booking-dialog.tsx",
    "list-06/components/agenda-data.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
