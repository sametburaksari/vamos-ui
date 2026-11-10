import { Card, CardBody, CardHeader, DescriptionList } from "@vamos-cms/ui";

export default function DescriptionListGrid() {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader title="Ece Demir" description="Employee · Studio team" />
      <CardBody>
        <DescriptionList
          layout="grid"
          columns={3}
          divided
          items={[
            { key: "title", label: "Job title", value: "Senior product designer" },
            { key: "manager", label: "Manager", value: "Meltem Aydın" },
            { key: "start", label: "Start date", value: "2023-03-06", format: "date" },
            { key: "location", label: "Location", value: "Istanbul · hybrid" },
            { key: "type", label: "Contract", value: "Full-time, permanent" },
            { key: "leave", label: "Leave balance", value: "11 days" },
            { key: "notes", label: "Notes", value: "In the office Tuesdays and Thursdays. Mentoring two junior designers since September.", span: "full" },
          ]}
        />
      </CardBody>
    </Card>
  );
}
