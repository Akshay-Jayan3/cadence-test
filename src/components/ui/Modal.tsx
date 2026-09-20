import {
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent,
} from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  className = '',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousActiveElement.current =
      document.activeElement as HTMLElement

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    requestAnimationFrame(() => {
      modalRef.current?.focus()
    })

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      document.body.style.overflow = previousOverflow

      previousActiveElement.current?.focus()
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-ink/50
        p-4
      "
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          title ? 'modal-title' : undefined
        }
        aria-describedby={
          description
            ? 'modal-description'
            : undefined
        }
        tabIndex={-1}
        className={`
          relative
          w-full
          rounded-xl
          bg-white
          shadow-xl
          outline-none
          ${className}
        `}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="
              absolute
              right-5
              top-5
              z-10
              flex
              size-6
              items-center
              justify-center
              rounded-md
              text-ink/40
              transition-colors
              hover:bg-canvas
              hover:text-ink
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary/30
            "
          >
            <CloseIcon />
          </button>
        )}

        {(title || description) && (
          <header className="border-b border-border p-6">
            {title && (
              <h2
                id="modal-title"
                className="text-title font-semibold text-ink"
              >
                {title}
              </h2>
            )}

            {description && (
              <p
                id="modal-description"
                className="mt-2 text-body text-ink/60"
              >
                {description}
              </p>
            )}
          </header>
        )}

        {children}
      </div>
    </div>,
    document.body,
  )
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}