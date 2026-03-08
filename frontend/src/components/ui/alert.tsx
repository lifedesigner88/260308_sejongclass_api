import type { HTMLAttributes } from 'react'

export function Alert({ style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      style={{
        borderRadius: 14,
        border: '1px solid rgba(239, 68, 68, 0.2)',
        background: 'rgba(254, 242, 242, 0.96)',
        color: '#991b1b',
        padding: '12px 14px',
        ...style,
      }}
    />
  )
}
