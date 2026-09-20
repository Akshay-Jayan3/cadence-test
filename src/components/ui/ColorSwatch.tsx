import type { ButtonHTMLAttributes } from 'react'

interface ColorSwatchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  color: string
  selected?: boolean
  label: string
}

export function ColorSwatch({
  color,
  selected = false,
  label,
  className = '',
  ...props
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      className={`
        size-6 rounded-full
        transition
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
        focus-visible:ring-offset-2
        ${selected ? 'ring-2 ring-ink ring-offset-2' : ''}
        ${className}
      `}
      style={{ backgroundColor: color }}
      {...props}
    />
  )
}