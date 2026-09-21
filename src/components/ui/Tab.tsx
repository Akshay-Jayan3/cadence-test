import type { ReactNode } from 'react'

export interface TabItem<T extends string> {
  value: T
  label: ReactNode
  /* Lets a single tab be shown but not selectable. */
  disabled?: boolean
  title?: string
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  disabled = false,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-disabled={disabled}
      className="inline-flex items-center rounded-md bg-canvas p-0.5"
    >
      {items.map((item) => {
        const isActive = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled || item.disabled}
            title={item.title}
            onClick={() => onChange(item.value)}
            className={`
              rounded-[5px]
              px-3
              py-1.5
              text-[10px]!
              font-medium!
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary/30
              disabled:pointer-events-none
              disabled:opacity-50
              ${
                isActive
                  ? 'bg-white text-ink shadow-sm font-bold!'
                  : 'text-ink hover:text-ink/70'
              }
            `}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}