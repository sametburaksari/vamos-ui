import { Button, Field, Input, Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTrigger, Textarea } from "@vamos-ui/react";

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Quick edit</Button>
      </SheetTrigger>
      <SheetContent side="end" size="md">
        <SheetHeader title="Quick edit" description="Winter menu at Kadıköy Bistro · last saved 4 min ago" />
        <SheetBody className="grid gap-4">
          <Field label="Title">
            <Input defaultValue="Winter menu at Kadıköy Bistro" />
          </Field>
          <Field label="Slug" hint="vamos.ist/blog/…">
            <Input defaultValue="winter-menu-kadikoy-bistro" />
          </Field>
          <Field label="Excerpt" hint="Shown in lists and search results.">
            <Textarea defaultValue="Slow-cooked lamb, roasted chestnuts and a new sahlep bar — what's on the menu from December." />
          </Field>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Cancel</Button>
          </SheetClose>
          <Button variant="primary">Update post</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
