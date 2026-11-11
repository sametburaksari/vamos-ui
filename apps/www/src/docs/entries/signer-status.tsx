import { ex, type DocEntry } from "../types";
import SignerStatusDemo from "../examples/signer-status/demo";
import SignerStatusSequential from "../examples/signer-status/sequential";
import SignerStatusDeclined from "../examples/signer-status/declined";

const entry: DocEntry = {
  slug: "signer-status",
  title: "Signer status",
  group: "Flows & wizards",
  description:
    "E-signature progress for quotes, contracts and offer letters: who signs, in which order, where each person is (sent, viewed, signed, declined) and when — with a segmented summary bar and a reminder action. It shows status from your signing provider; it does not collect signatures (use Signature pad for that).",
  source: ["business/signer-status.tsx"],
  usage: `import { SignerStatus } from "@vamos-ui/react/business";

<SignerStatus sequential signers={contract.signers} onRemind={(s) => api.remind(s.id)} />`,
  demo: ex("demo", "Demo", "signer-status/demo.tsx", SignerStatusDemo),
  examples: [
    ex("sequential", "Signing order with reminders (contracts)", "signer-status/sequential.tsx", SignerStatusSequential, "sequential numbers the signers; onRemind may return a promise — the button spins, then confirms."),
    ex("declined", "Declined (quote)", "signer-status/declined.tsx", SignerStatusDeclined, "A decline turns the summary red and shows the signer's note."),
  ],
  api: [
    { name: "SignerStatus", props: [
      { name: "signers", type: "Signer[]", description: "{ id, name, email?, role?, status: \"waiting\" | \"sent\" | \"viewed\" | \"signed\" | \"declined\", at?, note?, avatarSrc? }." },
      { name: "sequential", type: "boolean", description: "Signers sign in list order: numbered avatars, \"Signs 2\" for screen readers." },
      { name: "title", type: "ReactNode | null", default: '"Signatures"', description: "Region heading; null hides the header and summary bar." },
      { name: "onRemind", type: "(signer) => void | Promise<void>", description: "Adds Remind to sent / viewed rows." },
      { name: "now", type: "number", description: "Reference time for relative dates (tests, screenshots)." },
      { name: "labels", type: "Partial<SignerStatusLabels>", description: 'Dictionary namespace "signerStatus": title, summary, declinedSummary, complete, state names, remind, remindName, reminded, order.' },
    ] },
  ],
  covers: [],
};

export default entry;
