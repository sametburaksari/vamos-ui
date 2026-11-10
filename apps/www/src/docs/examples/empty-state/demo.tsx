import { Download, PenLine } from "lucide-react";
import { Button, EmptyState } from "@vamos-ui/react";

export default function EmptyStateDemo() {
  return (
    <EmptyState
      title="No posts yet"
      description="Write your first post, or bring your archive over from WordPress in one step."
      actions={
        <>
          <Button variant="primary">
            <PenLine /> Write a post
          </Button>
          <Button variant="ghost">
            <Download /> Import
          </Button>
        </>
      }
    />
  );
}
