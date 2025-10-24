import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  title,
  subtitle,
  headerRight,
  children,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-2xl overflow-hidden bg-slate-900/70 text-slate-200 backdrop-blur-md shadow-2xl ring-1 ring-white/5 hover:ring-white/10 transition",
        className
      )}
      {...props}
    >
      {(title || subtitle || headerRight) && (
        <div className={cn("px-6 py-4 flex items-start justify-between gap-3")}> 
          <div>
            {title && (
              <div className={cn("leading-none font-semibold text-slate-200 flex items-center gap-2")}>{title}</div>
            )}
            {subtitle && (
              <div className={cn("text-slate-400 text-sm mt-1")}>{subtitle}</div>
            )}
          </div>
          {headerRight && (
            <div className="shrink-0">{headerRight}</div>
          )}
        </div>
      )}

      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
}

function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props} />
  );
}

function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props} />
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

function CardContent({
  className,
  ...props
}) {
  return (<div data-slot="card-content" className={cn("px-6", className)} {...props} />);
}

function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

export default Card
