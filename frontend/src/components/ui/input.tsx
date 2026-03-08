import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        borderRadius: 12,
        border: '1px solid rgba(148, 163, 184, 0.34)',
        background: 'var(--input)',
        padding: '12px 14px',
        outline: 'none',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        ...props.style,
      }}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        borderRadius: 12,
        border: '1px solid rgba(148, 163, 184, 0.34)',
        background: 'var(--input)',
        padding: '12px 14px',
        outline: 'none',
        resize: 'vertical',
        ...props.style,
      }}
    />
  )
}
