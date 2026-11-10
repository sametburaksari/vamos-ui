import { Search } from "lucide-react";
import { Button, ButtonGroup, ButtonGroupText, Input } from "@vamos-ui/react";

export default function ButtonGroupWithInput() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <ButtonGroup aria-label="Search orders" className="w-full">
        <Input leading={<Search />} placeholder="Order number or customer" aria-label="Search orders" className="flex-1" />
        <Button variant="solid">Search</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Website address" className="w-full">
        <ButtonGroupText>https://</ButtonGroupText>
        <Input defaultValue="kadikoyroasters" aria-label="Subdomain" className="flex-1" />
        <ButtonGroupText>.vamos.site</ButtonGroupText>
      </ButtonGroup>
    </div>
  );
}
