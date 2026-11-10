"use client";

import * as React from "react";
import { Button, Card, CardBody, CardHeader, SkeletonGroup, SkeletonText } from "@vamos-cms/ui";

export default function SkeletonLoadingState() {
  const [loading, setLoading] = React.useState(true);
  return (
    <div className="grid w-full max-w-md gap-3">
      <Button size="sm" className="justify-self-start" onClick={() => setLoading((v) => !v)}>
        {loading ? "Show content" : "Show loading"}
      </Button>
      <Card>
        <CardHeader title="Spring menu launch" description="Draft · edited 2 hours ago" />
        <CardBody>
          {/* aria-busy + one announcement for the whole region, not one per line */}
          <SkeletonGroup loading={loading}>
            {loading ? (
              <SkeletonText lines={3} />
            ) : (
              <p className="text-sm leading-relaxed text-fg-muted">
                Twelve new dishes, a shorter brunch menu and Sunday hours from 9 am. The page goes live on March 21 with photos
                from the tasting.
              </p>
            )}
          </SkeletonGroup>
        </CardBody>
      </Card>
    </div>
  );
}
