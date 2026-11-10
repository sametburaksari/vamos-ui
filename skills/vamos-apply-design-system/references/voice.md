# Writing in the brand voice

`voice.tone` sets the register, `voice.rules` are hard rules, `voice.examples` show the target. Apply them to every string, not just headings.

| Surface | Checklist |
|---|---|
| Buttons | Verb + object ("Assign driver"), matches the rules' casing, no "OK"/"Submit" unless the rules allow it. |
| Page titles | The noun the user came for ("Shipments"), not a slogan. |
| Empty states | What is empty, why, and the one next action. |
| Errors | What happened, what to do, no blame, no "Oops". Keep error codes in `font-mono`. |
| Toasts | Past tense, specific ("Shipment KZ-2041 assigned to Ayşe Demir"). |
| Confirm dialogs | Name the consequence ("Delete 3 invoices? This can't be undone.") and label the button with the action ("Delete invoices"). |
| Placeholders and hints | Example of a real value, never a second label. |

## Applying rules
- Translate the rules when the UI language changes. "Sentence case" applies to Turkish too; "no exclamation marks" does as well.
- When a rule conflicts with clarity or accessibility (e.g. "be playful" on a destructive confirm), clarity wins. Mention it in your summary.

## Without a voice
Write plain, specific, sentence-case copy and tell the user the brand voice is not defined. Offer to add `voice` to vamos.brand.json with the **vamos-import-design-system** skill.
