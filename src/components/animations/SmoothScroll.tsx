"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.05,
        duration: 2.2,
        smoothWheel: true,
        wheelMultiplier: 0.7,
      }}
    >
      {children}
    </ReactLenis>
  );
}
