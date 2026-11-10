import { Alert } from "@vamos-ui/react";

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Alert title="This post has an unsaved revision">An autosave from 10:42 is newer than the published version.</Alert>
      <Alert tone="info" title="Scheduled for Nov 11, 09:00">Subscribers get the newsletter 10 minutes after publishing.</Alert>
      <Alert tone="success" title="Domain verified">vamos.ist is connected and serving HTTPS.</Alert>
      <Alert tone="warning" title="Payroll filing due in 3 days">Submit the November declaration before Dec 26 to avoid a late fee.</Alert>
      <Alert tone="danger" title="This company has no tax ID">Invoices to Northwind Trading can&apos;t be issued until you add one.</Alert>
      <Alert tone="accent" title="New: saved views">Save filters on any list and share them with your team.</Alert>
    </div>
  );
}
