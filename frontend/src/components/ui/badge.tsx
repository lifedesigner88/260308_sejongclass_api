import type { HTMLAttributes } from 'react'

export function Badge({ style, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '4px 10px',
        background: 'rgba(15, 118, 110, 0.1)',
        color: 'var(--primary)',
        fontSize: 12,
        fontWeight: 700,
        ...style,
      }}
    />
  )
}
