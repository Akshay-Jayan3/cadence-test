import type { InputHTMLAttributes } from 'react'

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Checkbox({
  label,
  id,
  className = '',
  ...props
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-2"
    >
      <input
        id={id}
        type="checkbox"
        className={`
          size-4
          accent-primary
          ${className}
        `}
        {...props}
      />

      {label && (
        <span className="text-label text-ink">
          {label}
        </span>
      )}
    </label>
  )
}