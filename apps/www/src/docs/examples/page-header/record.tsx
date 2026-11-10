import { Mail, Phone } from "lucide-react";
import { Avatar, Badge, Button, PageHeader } from "@vamos-ui/react";

export default function PageHeaderRecord() {
  return (
    <PageHeader
      className="w-full"
      size="sm"
      back={{ href: "/crm/contacts", label: "Contacts" }}
      title={
        <span className="inline-flex items-center gap-3">
          <Avatar name="Hannah Lindqvist" size="md" />
          Hannah Lindqvist
        </span>
      }
      meta={
        <>
          <Badge tone="success" dot>
            Customer
          </Badge>
          <Badge tone="outline">Northwind Traders</Badge>
          <span>Updated 2h ago</span>
        </>
      }
      actions={
        <>
          <Button size="sm">
            <Phone /> Call
          </Button>
          <Button size="sm" variant="primary">
            <Mail /> Email
          </Button>
        </>
      }
      menu={[
        { id: "merge", label: "Merge with…" },
        { id: "export", label: "Export vCard" },
        { type: "separator" },
        { id: "delete", label: "Delete contact", tone: "danger" },
      ]}
    />
  );
}
