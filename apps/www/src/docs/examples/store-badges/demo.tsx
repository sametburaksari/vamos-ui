import { StoreBadges } from "@vamos-ui/react";

export default function StoreBadgesDemo() {
  return (
    <StoreBadges
      appStore="https://apps.example.com/ios/tidy-days"
      googlePlay="https://apps.example.com/android/tidy-days"
      qr="https://example.com/get-the-app"
    />
  );
}
