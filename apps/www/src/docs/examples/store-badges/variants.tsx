import { StoreBadges } from "@vamos-ui/react";
import { Monitor } from "lucide-react";

/** Outline and large sizes, an extra store with your own wording, and Turkish labels. */
export default function StoreBadgesVariants() {
  return (
    <div className="grid gap-6">
      <StoreBadges
        variant="outline"
        appStore="https://apps.example.com/ios/tidy-days"
        googlePlay="https://apps.example.com/android/tidy-days"
        stores={[{ href: "https://example.com/download/desktop", lead: "Also for", name: "Desktop", icon: <Monitor /> }]}
      />
      <StoreBadges
        size="lg"
        appStore="https://apps.example.com/ios/tidy-days"
        googlePlay="https://apps.example.com/android/tidy-days"
        labels={{ label: "Uygulamayı edinin", appStoreLead: "Şuradan indirin", googlePlayLead: "Şuradan edinin" }}
      />
    </div>
  );
}
