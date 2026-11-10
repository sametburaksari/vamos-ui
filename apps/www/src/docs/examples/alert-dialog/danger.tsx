import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  Button,
} from "@vamos-cms/ui";
import { Trash2 } from "lucide-react";

export default function AlertDialogDanger() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="danger-ghost">
          <Trash2 /> Delete permanently
        </Button>
      </AlertDialogTrigger>
      {/* tone="danger": warning icon, danger action, and focus starts on Cancel. */}
      <AlertDialogContent tone="danger">
        <AlertDialogHeader
          title="Delete “Winter menu at Kadıköy Bistro”?"
          description="The post, its 3 revisions and 14 comments are removed for good. This can't be undone."
        />
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction>Delete post</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
