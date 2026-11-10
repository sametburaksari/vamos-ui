import { BarChart, type ChartConfig } from "@vamos-cms/ui/charts";

const tickets = [
  { day: "Mon", email: 64, chat: 92, phone: 21 },
  { day: "Tue", email: 71, chat: 104, phone: 26 },
  { day: "Wed", email: 58, chat: 88, phone: 19 },
  { day: "Thu", email: 77, chat: 116, phone: 31 },
  { day: "Fri", email: 69, chat: 97, phone: 24 },
  { day: "Sat", email: 22, chat: 41, phone: 6 },
  { day: "Sun", email: 18, chat: 35, phone: 4 },
];

const config = {
  chat: { label: "Chat" },
  email: { label: "Email" },
  phone: { label: "Phone" },
} satisfies ChartConfig;

export default function BarChartStacked() {
  // Only the top segment is rounded; the tooltip reads the total.
  return <BarChart title="Support tickets by channel" data={tickets} x="day" config={config} stack="stacked" height="md" className="w-full" />;
}
