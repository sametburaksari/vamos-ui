"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Baby, CalendarRange, Globe2, HeartPulse, Palmtree, Wallet } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  Checkbox,
  DateRangePicker,
  DescriptionItem,
  DescriptionList,
  Field,
  FileUpload,
  PageHeader,
  RadioGroup,
  RadioGroupItem,
  Stepper,
  Switch,
  Textarea,
  UserPicker,
  useFormat,
  type IsoDateRange,
  type UploadFile,
} from "@vamos-ui/react";
import { ApprovalStatus } from "./approval-status";
import { LeaveSidebar } from "./leave-sidebar";
import { TODAY, approvers, colleagues, leaveTypes, overlaps, teamAway, uploadDocument, workingDays, type LeaveTypeId } from "./data";

const icons: Record<LeaveTypeId, React.ReactNode> = {
  annual: <Palmtree />,
  sick: <HeartPulse />,
  remote: <Globe2 />,
  unpaid: <Wallet />,
  parental: <Baby />,
};

const steps = [
  { id: "type", title: "Leave type" },
  { id: "dates", title: "Dates" },
  { id: "handover", title: "Handover" },
  { id: "review", title: "Review" },
];

export interface LeaveDraft {
  type: LeaveTypeId | null;
  range: IsoDateRange | null;
  halfDay: boolean;
  /** Colleague id. */
  cover: string | null;
  handover: string;
  documents: UploadFile[];
  agreed: boolean;
}

const empty: LeaveDraft = { type: null, range: null, halfDay: false, cover: null, handover: "", documents: [], agreed: false };

type Errors = Partial<Record<"type" | "range" | "cover" | "handover" | "documents" | "agreed", string>>;

export function LeaveRequest() {
  const f = useFormat();
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<LeaveDraft>({ ...empty, type: "annual", range: { from: "2026-11-23", to: "2026-11-27" } });
  const [errors, setErrors] = React.useState<Errors>({});
  const [showErrors, setShowErrors] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submittedAt, setSubmittedAt] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const set = <K extends keyof LeaveDraft>(key: K, value: LeaveDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const coverUser = colleagues.find((c) => c.id === draft.cover) ?? null;
  const type = leaveTypes.find((t) => t.id === draft.type) ?? null;
  const complete = draft.range?.from && draft.range.to ? { from: draft.range.from, to: draft.range.to } : null;
  const singleDay = complete ? complete.from === complete.to : false;
  const span = complete ? workingDays(complete.from, complete.to) : { days: 0, skipped: [] };
  const days = singleDay && draft.halfDay ? 0.5 : span.days;
  const clashes = complete ? teamAway.filter((p) => overlaps(p, complete)) : [];
  const needsDocument = Boolean(type?.documentAfter && days > type.documentAfter);
  const needsCover = days > 2;

  const validate = (index: number): Errors => {
    const e: Errors = {};
    if (index >= 0 && !draft.type) e.type = "Choose what kind of leave this is.";
    if (index >= 1) {
      if (!complete) e.range = "Pick the first and last day.";
      else if (days === 0) e.range = "These dates are all weekends or public holidays.";
      else if (type?.balance != null && days > type.balance) e.range = `That’s ${f.number(days)} working days; you have ${type.balance} left.`;
    }
    if (index >= 2) {
      if (needsCover && !draft.cover) e.cover = "Leaves longer than 2 days need someone to cover.";
      if (needsCover && draft.handover.trim().length < 20) e.handover = "Add a short handover note (at least 20 characters).";
      if (needsDocument && !draft.documents.some((d) => d.status === "done")) e.documents = "Upload a doctor’s note for sick leave longer than 2 days.";
    }
    if (index >= 3 && !draft.agreed) e.agreed = "Confirm that you’ve read the leave policy.";
    return e;
  };

  // Re-validate as the person fixes things, once they've tried to continue.
  React.useEffect(() => {
    if (showErrors) setErrors(validate(step));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, step, showErrors]);

  const go = (next: number) => {
    setStep(next);
    setShowErrors(false);
    setErrors({});
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) {
      setErrors(e);
      setShowErrors(true);
      return;
    }
    if (step < steps.length - 1) return go(step + 1);
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmittedAt(new Date().toISOString());
    }, 900);
  };

  if (submittedAt && type && complete) {
    return (
      <Shell>
        <ApprovalStatus
          type={type}
          range={complete}
          days={days}
          cover={coverUser}
          submittedAt={submittedAt}
          onWithdraw={() => {
            setSubmittedAt(null);
            setDraft({ ...empty });
            go(0);
          }}
        />
        <LeaveSidebar typeId={draft.type} days={0} />
      </Shell>
    );
  }

  const stepItems = steps.map((s, i) => ({ ...s, status: i < step && Object.keys(validate(i)).length ? ("error" as const) : undefined }));
  const errorList = Object.values(errors);

  return (
    <Shell>
      <Card className="min-w-0">
        <div className="border-b border-line px-(--card-p) py-5">
          <Stepper value={step} onValueChange={go} steps={stepItems} size="sm" aria-label="Leave request" />
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <CardBody className="grid gap-5 py-6">
            <div>
              <p className="text-[12px] text-fg-subtle tabular">
                Step {step + 1} of {steps.length}
              </p>
              <h2 ref={headingRef} tabIndex={-1} className="font-display text-[length:calc(26px*var(--display-scale))] leading-tight text-fg outline-none">
                {["What kind of leave?", "When are you away?", "Who covers for you?", "Check and send"][step]}
              </h2>
            </div>

            {showErrors && errorList.length > 1 ? (
              <Alert tone="danger" size="sm" title={`${errorList.length} things to fix before you continue`} live="assertive">
                <ul className="list-disc ps-4">
                  {errorList.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </Alert>
            ) : null}

            {step === 0 ? (
              <Field label="Leave type" error={errors.type} required>
                <RadioGroup variant="card" value={draft.type} onValueChange={(v) => set("type", v as LeaveTypeId)} className="sm:grid-cols-2">
                  {leaveTypes.map((t) => (
                    <RadioGroupItem key={t.id} value={t.id} icon={icons[t.id]} label={t.label} description={t.description}>
                      {t.balance != null ? <span className="font-mono text-[12px] text-fg-muted tabular">{t.balance} days left</span> : null}
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </Field>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5">
                <Field label="First and last day" hint="Weekends and public holidays are not counted." error={errors.range} required>
                  <DateRangePicker
                    value={draft.range}
                    onValueChange={(r) => set("range", r)}
                    min={TODAY}
                    trigger="input"
                    nameFrom="from"
                    nameTo="to"
                    clearable
                  />
                </Field>
                {singleDay ? (
                  <div className="flex items-center justify-between gap-4 rounded-ui border border-line px-4 py-3">
                    <div>
                      <p id="half-day-label" className="text-[13.5px] font-medium text-fg">
                        Half day
                      </p>
                      <p className="text-[12.5px] text-fg-muted">Morning or afternoon — counts as 0.5 days.</p>
                    </div>
                    <Switch aria-labelledby="half-day-label" checked={draft.halfDay} onCheckedChange={(v) => set("halfDay", v)} />
                  </div>
                ) : null}
                {complete ? (
                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded-ui bg-surface-2 px-4 py-3" aria-live="polite">
                    <span className="flex items-center gap-2 text-[13.5px] text-fg">
                      <CalendarRange className="size-4 text-fg-subtle" aria-hidden />
                      {f.dateRange(complete.from, complete.to, "medium")}
                    </span>
                    <span className="font-mono text-[13px] text-fg tabular">
                      {f.number(days)} working {days === 1 ? "day" : "days"}
                    </span>
                    {span.skipped.length ? <span className="text-[12.5px] text-fg-muted">Skips {span.skipped.join(", ")}</span> : null}
                  </div>
                ) : null}
                {clashes.length ? (
                  <Alert tone="info" size="sm" title="Someone else on your team is away then">
                    {clashes.map((c) => `${c.name} · ${c.type}, ${f.dateRange(c.from, c.to, "medium")}`).join(" · ")}
                  </Alert>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-5">
                <Field label="Covering for you" hint={needsCover ? "They get a heads-up and see your open tasks." : "Optional for 2 days or less."} error={errors.cover} required={needsCover} optional={!needsCover}>
                  <UserPicker source={colleagues} value={draft.cover} onValueChange={(u) => set("cover", u)} roleLabel="Cover" placeholder="Choose a colleague" />
                </Field>
                <Field label="Handover note" hint="Open deals, deadlines, where files live." error={errors.handover} required={needsCover} optional={!needsCover}>
                  <Textarea
                    rows={4}
                    value={draft.handover}
                    onChange={(e) => set("handover", e.target.value)}
                    placeholder="Harbor & Pine proposal goes out Monday — Kerem has the deck. Defne Spa ads report is scheduled."
                  />
                </Field>
                {type?.documentAfter != null ? (
                  <Field label="Doctor’s note" hint="PDF or photo, up to 10 MB. Only HR can see it." error={errors.documents} required={needsDocument} optional={!needsDocument}>
                    <FileUpload
                      variant="compact"
                      accept={["application/pdf", "image/*"]}
                      maxSize={10_000_000}
                      maxFiles={2}
                      upload={uploadDocument}
                      value={draft.documents}
                      onValueChange={(files) => set("documents", files)}
                    />
                  </Field>
                ) : null}
              </div>
            ) : null}

            {step === 3 && type && complete ? (
              <div className="grid gap-5">
                <DescriptionList layout="horizontal" divided>
                  <DescriptionItem label="Type">{type.label}</DescriptionItem>
                  <DescriptionItem label="Dates">{f.dateRange(complete.from, complete.to, "long")}</DescriptionItem>
                  <DescriptionItem label="Working days">
                    <span className="font-mono tabular">{f.number(days)}</span>
                    {type.balance != null ? <span className="text-fg-muted"> · {f.number(type.balance - days)} left after this</span> : null}
                  </DescriptionItem>
                  <DescriptionItem label="Cover" emptyValue="Nobody">
                    {coverUser?.name}
                  </DescriptionItem>
                  <DescriptionItem label="Handover" emptyValue="No note">
                    {draft.handover.trim() || null}
                  </DescriptionItem>
                  <DescriptionItem label="Approval">{approvers.map((a) => `${a.name} (${a.role})`).join(" → ")}</DescriptionItem>
                </DescriptionList>
                <Checkbox
                  checked={draft.agreed}
                  onCheckedChange={(c) => set("agreed", c === true)}
                  invalid={Boolean(errors.agreed)}
                  label="I’ve read the leave policy"
                  description={errors.agreed ?? "Requests can be withdrawn until they’re approved."}
                />
              </div>
            ) : null}
          </CardBody>

          <CardFooter className="flex items-center justify-between gap-3 border-t border-line">
            <Button type="button" variant="ghost" disabled={step === 0 || submitting} onClick={() => go(step - 1)}>
              <ArrowLeft /> Back
            </Button>
            <Button type="submit" variant="primary" loading={submitting} loadingText="Sending…">
              {step === steps.length - 1 ? "Send for approval" : "Continue"}
              {step < steps.length - 1 ? <ArrowRight /> : null}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <LeaveSidebar typeId={draft.type} days={step >= 1 ? days : 0} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        eyebrow="People · Leave"
        title="Request time off"
        description="Your manager approves first, then HR. You’ll get an email at each step."
        back={{ href: "#", label: "Leave requests" }}
        className="mb-6"
      />
      <div className="grid items-start gap-(--gap) lg:grid-cols-[minmax(0,1fr)_19rem]">{children}</div>
    </div>
  );
}
