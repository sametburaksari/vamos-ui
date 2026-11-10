import { SelectContent, SelectGroup, SelectItem, SelectRoot, SelectSeparator, SelectTrigger, SelectValue } from "@vamos-cms/ui";

export default function SelectComposed() {
  return (
    <SelectRoot defaultValue="updated-desc">
      <SelectTrigger aria-label="Sort contacts" className="w-56" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup label="Activity">
          <SelectItem value="updated-desc">Recently updated</SelectItem>
          <SelectItem value="contacted-desc">Last contacted</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup label="Details">
          <SelectItem value="name-asc">Name, A → Z</SelectItem>
          <SelectItem value="company-asc">Company, A → Z</SelectItem>
          <SelectItem value="value-desc">Deal value, high → low</SelectItem>
        </SelectGroup>
      </SelectContent>
    </SelectRoot>
  );
}
