import { AuthFrame } from "../login-02/components/auth-frame";
import { WorkspaceChooser } from "./components/workspace-chooser";

/** After sign-in: pick a workspace (search, pending invitations), then the app to open in it. */
export default function SelectWorkspace01() {
  return (
    <AuthFrame
      width="lg"
      topAction={
        <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">
          Sign out
        </a>
      }
    >
      <WorkspaceChooser />
    </AuthFrame>
  );
}
