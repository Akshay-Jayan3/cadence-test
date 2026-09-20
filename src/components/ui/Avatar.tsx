import type { ImgHTMLAttributes } from 'react'

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-label',
  lg: 'size-10 text-body',
}

export function Avatar({
  fallback,
  size = 'md',
  alt = '',
  className = '',
  src,
  ...props
}: AvatarProps) {
  if (!src && fallback) {
    return (
      <div
        role="img"
        aria-label={alt || fallback}
        className={`
          flex shrink-0 items-center justify-center
          rounded-full bg-primary/10
          font-semibold text-primary
          ${sizeStyles[size]}
          ${className}
        `}
      >
        {fallback}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`
        shrink-0 rounded-full object-cover
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    />
  )
}