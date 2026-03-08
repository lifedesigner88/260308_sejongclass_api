import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('ui-card', className)}
      style={{
        borderRadius: 'var(--radius)',
        border: '1px solid var(--card-border)',
        background: 'var(--card)',
        boxShadow: 'var(--shadow)',
        backdropFilter: 'blur(12px)',
        ...style,
      }}
      {...props}
    />
  )
}

export function CardHeader({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} style={{ padding: '22px 22px 0', ...style }} {...props} />
}

export function CardTitle({ className, style, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn(className)} style={{ margin: 0, fontSize: 22, ...style }} {...props} />
}

export function CardDescription({ className, style, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(className)} style={{ margin: '8px 0 0', color: 'var(--muted)', ...style }} {...props} />
}

export function CardContent({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} style={{ padding: 22, ...style }} {...props} />
}
