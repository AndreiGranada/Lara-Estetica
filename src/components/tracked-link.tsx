"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import type { AnalyticsPayload } from "@/lib/analytics";
import { trackEvent } from "@/lib/analytics";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  eventPayload?: AnalyticsPayload;
};

export function TrackedLink({
  eventName,
  eventPayload,
  onClick,
  ...props
}: TrackedLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackEvent(eventName, eventPayload);
    onClick?.(event);
  };

  return <a {...props} onClick={handleClick} />;
}
