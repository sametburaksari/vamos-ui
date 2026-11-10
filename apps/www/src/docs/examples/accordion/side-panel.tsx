import { CalendarClock, FolderTree, Plus, Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, IconButton } from "@vamos-cms/ui";

// CMS editor side panel: summaries in the header, actions beside it.
export default function AccordionSidePanel() {
  return (
    <div className="w-80">
      <Accordion type="multiple" variant="card" size="sm" defaultValue={["publish", "seo"]}>
        <AccordionItem value="publish">
          <AccordionTrigger icon={<CalendarClock />} meta="Scheduled">
            Publishing
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1.5">
            <p>
              Goes live <span className="font-medium text-fg">Nov 14, 2026 · 09:00</span>
            </p>
            <p>Visibility: public · Author: Elif Kaya</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="taxonomy">
          <AccordionTrigger icon={<FolderTree />} meta="3 selected" actions={<IconButton label="Add category" size="xs"><Plus /></IconButton>}>
            Categories
          </AccordionTrigger>
          <AccordionContent className="flex flex-wrap gap-1.5">
            <Badge size="md">Guides</Badge>
            <Badge size="md">Restaurants</Badge>
            <Badge size="md">Istanbul</Badge>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="seo">
          <AccordionTrigger icon={<Search />} meta={<Badge tone="warning">2 issues</Badge>}>
            SEO
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            <p>Meta description is 182 characters — keep it under 160.</p>
            <p>Add alt text to 1 image.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="revisions" disabled>
          <AccordionTrigger meta="Pro plan">Revisions</AccordionTrigger>
          <AccordionContent>Version history.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
