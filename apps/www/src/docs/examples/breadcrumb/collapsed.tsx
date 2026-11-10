import { Breadcrumb } from "@vamos-ui/react";

export default function BreadcrumbCollapsed() {
  return (
    <Breadcrumb
      maxItems={4}
      items={[
        { label: "Departments", href: "/hr/departments" },
        { label: "Engineering", href: "/hr/departments/engineering" },
        { label: "Platform", href: "/hr/departments/engineering/platform" },
        { label: "Infrastructure", href: "/hr/departments/engineering/platform/infrastructure" },
        { label: "Site reliability", href: "/hr/departments/engineering/platform/infrastructure/sre" },
        { label: "Mert Aydın" },
      ]}
    />
  );
}
