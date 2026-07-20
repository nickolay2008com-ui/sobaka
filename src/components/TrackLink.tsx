"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent } from "@/components/TrackPage";

type Props = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  children: ReactNode;
};

export function TrackLink({ eventName, children, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        void trackEvent(eventName, { href: String(props.href) });
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
