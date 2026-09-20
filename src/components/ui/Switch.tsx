import type { InputHTMLAttributes } from 'react'

interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Switch({
  label,
  id,
  className = '',
  ...props
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-3"
    >
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        {...props}
      />

      <span
        className={`
          relative h-6 w-10 rounded-full
          bg-border
          transition-colors
          peer-checked:bg-primary
          peer-focus-visible:ring-2
          peer-focus-visible:ring-primary/20
          ${className}
        `}
      >
        <span
          className="
            absolute left-1 top-1
            size-4 rounded-full
            bg-white
            transition-transform
            peer-checked:translate-x-4
          "
        />
      </span>

      {label && (
        <span className="text-label text-ink">
          {label}
        </span>
      )}
    </label>
  )
}