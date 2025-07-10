import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'form-input',
            error && 'border-[var(--error)] focus:border-[var(--error)] focus:shadow-[0_0_0_2px_rgba(239,83,80,0.2)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[var(--error)]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
