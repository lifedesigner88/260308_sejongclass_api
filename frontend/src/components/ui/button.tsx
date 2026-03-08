import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'

const styles: Record<ButtonVariant, string> = {
  default: 'background:var(--primary);color:var(--primary-foreground);border-color:transparent;',
  secondary: 'background:var(--secondary);color:var(--secondary-foreground);border-color:transparent;',
  outline: 'background:transparent;color:var(--foreground);border-color:rgba(148,163,184,.4);',
  destructive: 'background:var(--destructive);color:var(--destructive-foreground);border-color:transparent;',
  ghost: 'background:transparent;color:var(--foreground);border-color:transparent;',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ className, style, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn('ui-button', className)}
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'solid',
        padding: '10px 14px',
        fontWeight: 600,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.6 : 1,
        transition: 'all .18s ease',
        ...Object.fromEntries(
          styles[variant]
            .split(';')
            .filter(Boolean)
            .map((entry) => entry.split(':')),
        ),
        ...style,
      }}
      {...props}
    />
  )
}
