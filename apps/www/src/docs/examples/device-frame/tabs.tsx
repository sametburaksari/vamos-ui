"use client";

import * as React from "react";
import { DeviceFrame, DeviceScreens, Tabs, TabsList, TabsTrigger } from "@vamos-ui/react";
import { PlanScreen, ShareScreen, TodayScreen } from "./_screens";

const features = [
  { id: "today", title: "See your day", screen: <TodayScreen />, alt: "Today screen with three tasks" },
  { id: "plan", title: "Plan the week", screen: <PlanScreen />, alt: "Week plan with a bar per day" },
  { id: "share", title: "Share lists", screen: <ShareScreen />, alt: "Three shared lists with their members" },
];

/** Feature tabs drive one phone: the screens stay mounted and cross-fade. */
export default function DeviceFrameTabs() {
  const [tab, setTab] = React.useState("today");
  const current = features.find((f) => f.id === tab)!;
  return (
    <div className="grid w-full items-center gap-8 sm:grid-cols-[1fr_16rem]">
      <Tabs value={tab} onValueChange={setTab} orientation="vertical">
        <TabsList aria-label="Features">
          {features.map((f) => (
            <TabsTrigger key={f.id} value={f.id}>
              {f.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DeviceFrame statusBar="09:41" label={current.alt}>
        <DeviceScreens active={tab} transition="slide" screens={features.map((f) => ({ id: f.id, content: f.screen }))} />
      </DeviceFrame>
    </div>
  );
}
