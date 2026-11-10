import { ChevronDown } from "lucide-react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Field,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@vamos-cms/ui";

export default function DialogNested() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Insert link</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader title="Insert link" description="Menus and popovers opened inside stay opaque — only the overlay blurs." />
        <DialogBody className="grid gap-4">
          <Field label="URL">
            <Input defaultValue="https://vamos.ist/blog/winter-menu" />
          </Field>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  Open in <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Same tab</DropdownMenuItem>
                <DropdownMenuItem>New tab</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost">
                  SEO tips
                </Button>
              </PopoverTrigger>
              <PopoverContent className="max-w-64 text-[13px] text-fg-muted">Descriptive link text (“winter menu”) ranks better than “click here”.</PopoverContent>
            </Popover>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <Button variant="primary">Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
