import { Field, Input } from "@vamos-cms/ui";

export default function InputField() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <Field label="Title" required hint="Keep it under 60 characters for search results.">
        <Input placeholder="Post title" />
      </Field>
      <Field label="Work email" error="This address is already registered." labelAction={<a href="#reset" className="text-accent-ink hover:underline">Reset password</a>}>
        <Input type="email" defaultValue="hello@vamos.ist" />
      </Field>
    </div>
  );
}
