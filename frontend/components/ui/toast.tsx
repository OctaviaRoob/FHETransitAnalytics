'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:right-0 sm:top-0 sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: 'success' | 'error' | 'info' | 'warning'
  }
>(({ className, variant = 'info', ...props }, ref) => {
  const variantClasses = {
    success: 'border-[var(--success-border)] bg-[var(--success-soft)] backdrop-blur-xl',
    error: 'border-[rgba(239,83,80,0.28)] bg-[var(--error-soft)] backdrop-blur-xl',
    info: 'border-[rgba(59,130,246,0.28)] bg-[var(--info-soft)] backdrop-blur-xl',
    warning: 'border-[rgba(243,177,59,0.28)] bg-[var(--warning-soft)] backdrop-blur-xl',
  }

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-[var(--radius-md)] border p-4 pr-6 shadow-lg transition-all',
        'data-[swipe=cancel]:translate-x-0',
        'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[swipe=move]:transition-none',
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[swipe=end]:animate-out',
        'data-[state=closed]:fade-out-80',
        'data-[state=closed]:slide-out-to-right-full',
        'data-[state=open]:slide-in-from-top-full',
        'data-[state=open]:sm:slide-in-from-bottom-full',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-[var(--radius-full)] border bg-transparent px-3 text-sm font-medium transition-colors',
      'hover:bg-[var(--color-panel-alt)]',
      'focus:outline-none focus:ring-1 focus:ring-[var(--accent)]',
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-1 top-1 rounded-md p-1 text-[var(--color-text-muted)] opacity-0 transition-opacity',
      'hover:text-[var(--color-text)]',
      'focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold [&+div]:text-xs', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

// Toast Icon Component
const ToastIcon = ({ variant }: { variant?: 'success' | 'error' | 'info' | 'warning' }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />,
    error: <AlertCircle className="h-5 w-5 text-[var(--error)]" />,
    info: <Info className="h-5 w-5 text-[var(--info)]" />,
    warning: <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />,
  }
  return icons[variant || 'info']
}

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
}
