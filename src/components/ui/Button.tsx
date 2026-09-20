import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'icon'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children?: ReactNode
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-md transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-[13px]!'

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-12 px-6',
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:opacity-90',

  secondary:
    'border border-border bg-white text-ink hover:bg-canvas',

  danger:
    'border border-danger bg-white text-danger hover:bg-danger/5',

  icon:
    'size-9 border border-border bg-white text-ink hover:bg-canvas',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  const sizeClass =
    variant === 'icon'
      ? ''
      : sizeStyles[size]

  return (
    <button
      type={type}
      className={`
        ${baseStyles}
        ${sizeClass}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}