import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger, Field, Input } from "@vamos-cms/ui";

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary">New contact</Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader title="New contact" description="Add a contact manually. You can import a CSV later." />
        <DialogBody className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" required>
              <Input defaultValue="Elif" />
            </Field>
            <Field label="Last name" required>
              <Input defaultValue="Demir" />
            </Field>
          </div>
          <Field label="Work email" hint="Invoices and quotes go to this address.">
            <Input type="email" placeholder="elif@modawellness.com" />
          </Field>
          <Field label="Company" optional>
            <Input placeholder="Moda Wellness" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <Button variant="primary">Save contact</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
