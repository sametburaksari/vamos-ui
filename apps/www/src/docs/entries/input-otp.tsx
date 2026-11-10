import { ex, type DocEntry } from "../types";
import InputOTPDemo from "../examples/input-otp/demo";
import InputOTPGroups from "../examples/input-otp/groups";
import InputOTPAutoSubmit from "../examples/input-otp/auto-submit";

const entry: DocEntry = {
  slug: "input-otp",
  title: "Input OTP",
  group: "Forms & inputs",
  description:
    "One-time code entry for 2FA sign-in, SMS verification, customer-portal email codes and payment confirmation. One real input underneath — screen readers, SMS autofill, password managers and paste all see a single field — with visual slots drawn over it.",
  source: ["components/input-otp.tsx", "styles/forms.css"],
  basedOn: "input-otp",
  usage: `import { Field, InputOTP } from "@vamos-cms/ui";

<Field label="Verification code">
  <InputOTP name="code" groups={[3, 3]} onComplete={verify} />
</Field>`,
  demo: ex("demo", "Demo", "input-otp/demo.tsx", InputOTPDemo),
  examples: [
    ex("groups", "Groups, patterns and masking", "input-otp/groups.tsx", InputOTPGroups, "groups={[3, 3]} reads as 123–456. pattern=\"alphanumeric\" for backup codes; mask shows dots for PINs. size=\"lg\" for sign-in pages."),
    ex("auto-submit", "Verify on complete (payments)", "input-otp/auto-submit.tsx", InputOTPAutoSubmit, "onComplete fires when every slot is filled. loading shows a spinner and makes the input read-only; a Field error shakes the slots once (not under reduced motion)."),
  ],
  api: [
    {
      name: "InputOTP",
      props: [
        { name: "length", type: "number", default: "6", description: "Number of characters." },
        { name: "groups", type: "number[]", description: "Slot grouping, e.g. [3, 3]. Must add up to length." },
        { name: "value / defaultValue", type: "string", default: '""', description: "The code (controlled / uncontrolled)." },
        { name: "onValueChange", type: "(value: string) => void", description: "Called on every change." },
        { name: "onComplete", type: "(value: string) => void", description: "Called once all slots are filled." },
        { name: "pattern", type: '"digits" | "alphanumeric" | RegExp', default: '"digits"', description: "Allowed characters; digits also sets inputMode=numeric." },
        { name: "mask", type: "boolean", default: "false", description: "Show dots instead of characters." },
        { name: "size", type: '"md" | "lg"', default: '"md"', description: "Slot size from --control-h." },
        { name: "loading", type: "boolean", default: "false", description: "Verifying: spinner with status text, input read-only, aria-busy." },
        { name: "invalid", type: "boolean", description: "Danger slots + aria-invalid. Set by Field error." },
        { name: "name / disabled / autoFocus", type: "string / boolean", description: "Native input props; name submits the code." },
        { name: "labels", type: "Partial<InputOTPLabels>", description: "label (“Verification code, {length} digits”), labelCharacters, verifying." },
      ],
    },
    {
      name: "InputOTPRoot · InputOTPGroup · InputOTPSlot · InputOTPSeparator",
      props: [
        { name: "maxLength", type: "number", description: "InputOTPRoot: required. Takes every InputOTP prop except length/groups." },
        { name: "index", type: "number", description: "InputOTPSlot: which character the slot shows." },
        { name: "containerClassName", type: "string", description: "InputOTPRoot: classes for the slot container." },
      ],
    },
  ],
  notes: [
    'autocomplete="one-time-code" lets iOS and Android offer the code from the SMS; paste fills every slot.',
    "Without a Field label the input is named from the dictionary (“Verification code, 6 digits”).",
    "Slots are always left-to-right, also on RTL pages.",
  ],
  covers: ["Input OTP"],
};

export default entry;
