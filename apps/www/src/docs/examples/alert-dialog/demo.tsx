import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  Button,
} from "@vamos-ui/react";

export default function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Close deal as lost</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader title="Close “Moda Wellness — Q1 retainer” as lost?" description="The deal leaves the pipeline and its $4,500 forecast. You can reopen it from the deal page." />
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction>Close as lost</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
