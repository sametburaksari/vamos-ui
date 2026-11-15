import { EmailCapture } from "@vamos-ui/react";

export default function EmailCaptureStates() {
  return (
    <div className="grid w-full max-w-xl gap-6">
      <EmailCapture initialState={{ status: "invalid", errors: { email: "Enter an email address like name@example.com." }, values: { email: "reader@" } }} />
      <EmailCapture initialState={{ status: "error", values: { email: "reader@example.com" } }} />
      <EmailCapture initialState={{ status: "success" }} />
    </div>
  );
}
