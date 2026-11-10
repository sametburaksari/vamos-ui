import { Copy, Download, Share2, Trash2 } from "lucide-react";
import { Button, Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger } from "@vamos-ui/react";

const actions = [
  { icon: Share2, label: "Share link" },
  { icon: Copy, label: "Duplicate" },
  { icon: Download, label: "Download PDF" },
];

export default function SheetDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Invoice actions</Button>
      </DrawerTrigger>
      {/* Drag the handle or header down to close. Esc and × always work too. */}
      <DrawerContent size="md">
        <DrawerHeader title="Invoice VMS-2026-0418" description="Moda Wellness · $4,500.00 · due Dec 4" />
        <DrawerBody className="grid gap-1 pb-4" flush>
          {actions.map(({ icon: Icon, label }) => (
            <DrawerClose key={label} asChild>
              <Button variant="ghost" className="mx-3 justify-start">
                <Icon /> {label}
              </Button>
            </DrawerClose>
          ))}
          <DrawerClose asChild>
            <Button variant="danger-ghost" className="mx-3 justify-start">
              <Trash2 /> Void invoice
            </Button>
          </DrawerClose>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
