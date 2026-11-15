import { DeviceFrame } from "@vamos-ui/react";
import { TodayScreen } from "./_screens";

export default function DeviceFrameDemo() {
  return (
    <div className="w-full max-w-[18rem]">
      <DeviceFrame device="phone" statusBar="09:41" label="Today screen: one of three tasks done, two still due">
        <TodayScreen />
      </DeviceFrame>
    </div>
  );
}
