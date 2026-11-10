import { Delta } from "@vamos-cms/ui";

export default function StatDelta() {
  return (
    <div className="grid gap-4 text-[13px]">
      <div className="flex flex-wrap items-center gap-4">
        <Delta value={0.124} />
        <Delta value={-0.041} />
        <Delta value={0} />
        <Delta value={null} />
        <Delta value={-0.18} intent="lower-is-better" />
        <Delta value={0.2} intent="neutral" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Delta variant="badge" value={0.124} />
        <Delta variant="badge" value={-0.041} />
        <Delta variant="badge" value={0} />
        <Delta variant="badge" value={1250} kind="currency" />
        <Delta variant="badge" value={-6} kind="number" />
      </div>
    </div>
  );
}
