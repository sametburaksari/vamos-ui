import { Card, CardBody, CardHeader, DescriptionItem, DescriptionList } from "@vamos-ui/react";

export default function DescriptionListCopyable() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader title="Payment details" description="Share these with the client for a bank transfer." />
      <CardBody>
        <DescriptionList labelWidth="9rem">
          <DescriptionItem label="Account holder">Vamos Dijital Ltd.</DescriptionItem>
          <DescriptionItem label="IBAN" copyable="TR330006100519786457841326">
            <span className="font-mono tabular">TR33 0006 1005 1978 6457 8413 26</span>
          </DescriptionItem>
          <DescriptionItem label="SWIFT" copyable>
            TGBATRIS
          </DescriptionItem>
          <DescriptionItem label="Reference" copyable hint="Ask the client to include it in the transfer note.">
            INV-2041
          </DescriptionItem>
        </DescriptionList>
      </CardBody>
    </Card>
  );
}
