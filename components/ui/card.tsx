import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("clinical-card", className)} {...props} />;
}

export function CardHeader({
  title,
  eyebrow,
  action,
  className
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-slate-200 p-5", className)}>
      <div>
        {eyebrow ? <p className="label-caps mb-1">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
