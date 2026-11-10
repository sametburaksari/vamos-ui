import { Badge, ScrollArea } from "@vamos-ui/react";

const cuisines = ["All", "Breakfast", "Turkish", "Seafood", "Vegan", "Coffee", "Kebab", "Meze", "Bakery", "Italian", "Japanese", "Street food", "Fine dining", "Desserts"];

export default function ScrollAreaHorizontal() {
  return (
    <ScrollArea orientation="horizontal" fade className="w-full max-w-md">
      <div className="flex w-max gap-2 pb-3">
        {cuisines.map((c, i) => (
          <Badge key={c} size="lg" tone={i === 0 ? "accent" : "outline"}>
            {c}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  );
}
