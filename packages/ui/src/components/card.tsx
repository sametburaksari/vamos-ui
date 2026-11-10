import * as React from "react";
import { cn } from "../lib/cn";

/** Main content surface. Takes its material (glass/solid) from tokens. */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={cn("surface rounded-ui-lg", className)} {...props} />;
});

export function CardHeader({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-4 pb-3", className)}>
      <div className="min-w-0">
        {title ? <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-fg">{title}</h3> : null}
        {description ? <p className="mt-0.5 text-[13px] text-fg-muted">{description}</p> : null}
        {children}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-1.5">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2 border-t border-line px-5 py-3", className)} {...props} />;
}

/** A secondary tile inside a card. */
export function Inset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("surface-2 rounded-ui", className)} {...props} />;
}
