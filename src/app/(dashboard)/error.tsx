"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  // A boundary-caught error never reaches window.onerror, so report it here.
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <Card className="mx-auto mt-8 max-w-md">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="space-y-1">
          <h2 className="font-serif text-xl text-foreground">This page couldn&apos;t load</h2>
          <p className="text-sm text-muted-foreground">
            The connection may have dropped. Check your connection and try again.
          </p>
        </div>
        <Button onClick={() => unstable_retry()}>
          <RotateCw size={16} className="mr-2" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
