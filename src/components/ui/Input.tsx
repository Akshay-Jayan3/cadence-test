import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leadingIcon?: ReactNode
}

export function Input({
  label,
  error,
  leadingIcon,
  id,
  className = '',
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className="text-body font-medium text-ink"
        >
          {label}
        </label>
      )}

      <div
        className={`
          flex items-center
          rounded-lg border
          bg-white
          transition-colors
          ${error ? 'border-danger' : 'border-border'}
          ${disabled ? 'bg-canvas' : ''}
          focus-within:border-primary
          ${className}
        `}
      >
        {leadingIcon && (
          <span className="ml-4 shrink-0 text-ink/50">
            {leadingIcon}
          </span>
        )}

        <input
          id={id}
          disabled={disabled}
          className="
            min-w-0 flex-1
            border-0 bg-transparent
            px-3 py-2
            text-body text-ink
            outline-none
            placeholder:text-ink/50
            disabled:cursor-not-allowed
            disabled:text-ink/40
          "
          {...props}
        />
      </div>

      {error && (
        <span className="text-label text-danger">
          {error}
        </span>
      )}
    </div>
  )
}