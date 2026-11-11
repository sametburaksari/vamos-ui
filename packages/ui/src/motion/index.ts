// @vamos-ui/react/motion — CSS-first motion primitives. Styles live in styles/motion.css
// (already part of @vamos-ui/react/styles.css).
export { motionLevel, motionAllowed, prefersReducedMotion, type MotionLevel } from "./core";
export { MotionScope, type MotionScopeProps } from "./motion-scope";
export { Reveal, Stagger, useReveal, useFreshMount, type RevealProps, type StaggerProps, type RevealEffect, type UseRevealOptions } from "./reveal";
export { CountUp, type CountUpProps } from "./count-up";
export { Ticker, type TickerProps } from "./ticker";
export { Parallax, ScrollProgress, type ParallaxProps, type ScrollProgressProps } from "./parallax";
export { TextReveal, type TextRevealProps } from "./text-reveal";
export { Tilt, Magnetic, type TiltProps, type MagneticProps } from "./pointer";
export { PageTransition, startPageTransition, viewTransitionsSupported, type PageTransitionProps, type StartPageTransitionOptions } from "./page-transition";
export { SkeletonSwap, type SkeletonSwapProps } from "./skeleton-swap";
export { useScrollShrink, type UseScrollShrinkOptions } from "./scroll-shrink";
