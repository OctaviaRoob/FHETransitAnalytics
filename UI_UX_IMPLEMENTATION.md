# UI/UX Implementation Guide

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Design System](#design-system)
- [CSS Variables](#css-variables)
- [Component Library](#component-library)
- [Glassmorphism Effects](#glassmorphism-effects)
- [Responsive Design](#responsive-design)
- [Animation System](#animation-system)
- [Accessibility](#accessibility)
- [Dark Mode Support](#dark-mode-support)

---

## Design Philosophy

### Core Principles

1. **Privacy-First Design**: Visual elements emphasize data protection and encryption
2. **Modern Glassmorphism**: Translucent layers create depth and hierarchy
3. **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation
4. **Responsive**: Mobile-first approach with breakpoints at 640px, 768px, 1024px
5. **Performance**: CSS animations with hardware acceleration

### Visual Language

- **Transparency**: Represents encrypted data flow
- **Blur Effects**: Symbolizes privacy protection
- **Gradient Borders**: Highlight secure operations
- **Smooth Transitions**: Guide user attention

---

## Design System

### Color Palette

#### Primary Colors
```css
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Brand color */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

#### Neutral Colors
```css
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;
```

#### Semantic Colors
```css
--success: #10b981;  /* Green for successful operations */
--warning: #f59e0b;  /* Amber for pending states */
--error: #ef4444;    /* Red for errors */
--info: #3b82f6;     /* Blue for information */
```

### Typography

#### Font Stack
```css
--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas,
             "Liberation Mono", "Courier New", monospace;
```

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

#### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;  /* Fully rounded */
```

---

## CSS Variables

### Complete Variable System

```css
:root {
  /* Colors */
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 4% 16%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 4% 16%;
  --muted-foreground: 240 5% 65%;
  --accent: 240 4% 16%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 63% 31%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 4% 16%;
  --input: 240 4% 16%;
  --ring: 217 91% 60%;

  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --glass-blur: blur(8px);

  /* Animations */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-index layers */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

---

## Component Library

### Card Component

**Purpose**: Container for content sections with glassmorphism effect

**Implementation**:
```typescript
// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'solid';
}

export function Card({ children, className, variant = 'glass' }: CardProps) {
  const variants = {
    default: 'bg-card border-border',
    glass: 'bg-white/5 backdrop-blur-lg border-white/10',
    solid: 'bg-card/80 border-border'
  };

  return (
    <div className={cn(
      'rounded-2xl border p-6 shadow-xl transition-all',
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}
```

**CSS**:
```css
.card-glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: var(--radius-2xl);
}
```

**Usage**:
```tsx
<Card variant="glass">
  <h2>Encrypted Data</h2>
  <p>Your transit card information is protected</p>
</Card>
```

---

### Button Component

**Purpose**: Interactive elements with multiple variants

**Implementation**:
```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'default',
  size = 'md',
  isLoading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-13 px-8 text-lg'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}
```

**Variants**:
- `default`: Standard button with primary color
- `primary`: Blue background (action buttons)
- `secondary`: Muted background (secondary actions)
- `destructive`: Red background (dangerous actions)
- `ghost`: Transparent with hover effect

**Usage**:
```tsx
<Button variant="primary" size="lg" onClick={handleSubmit}>
  Submit Encrypted Data
</Button>
```

---

### Input Component

**Purpose**: Form inputs with glassmorphism styling

**Implementation**:
```typescript
// components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full rounded-xl border border-input bg-white/5 px-4 py-3',
            'text-foreground placeholder:text-muted-foreground',
            'backdrop-blur-sm transition-all',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            icon && 'pl-10',
            error && 'border-destructive focus:ring-destructive/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
```

**Features**:
- Optional label and error message
- Icon support (left-aligned)
- Glassmorphism background
- Focus states with ring

**Usage**:
```tsx
<Input
  label="Monthly Spending (cents)"
  type="number"
  placeholder="Enter amount"
  icon={<DollarSign />}
  error={errors.spending}
/>
```

---

### Toast Notification Component

**Purpose**: Temporary feedback messages

**Implementation**:
```typescript
// components/ui/Toast.tsx
interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />
  };

  const colors = {
    success: 'bg-success/10 border-success text-success',
    error: 'bg-destructive/10 border-destructive text-destructive',
    info: 'bg-info/10 border-info text-info',
    warning: 'bg-warning/10 border-warning text-warning'
  };

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50',
      'flex items-center gap-3 rounded-xl border p-4',
      'backdrop-blur-lg shadow-lg',
      'animate-in slide-in-from-bottom-5',
      colors[type]
    )}>
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
```

**Auto-dismiss**: Closes after 5 seconds
**Animation**: Slides in from bottom

---

### Badge Component

**Purpose**: Status indicators and labels

**Implementation**:
```typescript
// components/ui/Badge.tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      variants[variant],
      sizes[size]
    )}>
      {children}
    </span>
  );
}
```

**Usage**:
```tsx
<Badge variant="success">Encrypted</Badge>
<Badge variant="warning">Pending Analysis</Badge>
```

---

### Skeleton Loader Component

**Purpose**: Loading state placeholders

**Implementation**:
```typescript
// components/ui/Skeleton.tsx
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-muted/50',
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <Card>
      <div className="space-y-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-32" />
      </div>
    </Card>
  );
}
```

---

## Glassmorphism Effects

### Core Glassmorphism CSS

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.glass-card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card-hover:hover {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.45);
}
```

### Gradient Borders

```css
.gradient-border {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-2xl);
  padding: 1px;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg,
    rgba(59, 130, 246, 0.5),
    rgba(147, 51, 234, 0.5)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

### Usage in Components

```tsx
// High-priority card with gradient border
<div className="gradient-border glass-card-hover">
  <div className="p-6">
    <h3>Encrypted Data Submitted</h3>
    <p>Your information is secure</p>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
/* xs: 0px - 639px (default) */
@media (min-width: 640px) {  /* sm */
  .container { max-width: 640px; }
}

@media (min-width: 768px) {  /* md */
  .container { max-width: 768px; }
}

@media (min-width: 1024px) { /* lg */
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) { /* xl */
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) { /* 2xl */
  .container { max-width: 1536px; }
}
```

### Responsive Grid

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {cards.map(card => <Card key={card.id}>{card.content}</Card>)}
</div>
```

### Mobile Navigation

```tsx
// components/MobileNav.tsx
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="glass-card p-6">
            {/* Navigation items */}
          </div>
        </div>
      )}
    </>
  );
}
```

---

## Animation System

### CSS Animations

```css
/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Pulse animation for loading states */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Slide in from bottom (for toasts) */
@keyframes slideInFromBottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in-bottom {
  animation: slideInFromBottom 0.3s ease-out;
}
```

### React Spring Animations

```typescript
// components/AnimatedCard.tsx
import { useSpring, animated } from '@react-spring/web';

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  const [springs, api] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 60 }
  }));

  return (
    <animated.div style={springs}>
      <Card>{children}</Card>
    </animated.div>
  );
}
```

### Framer Motion Variants

```typescript
// Staggered list animation
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Usage
<motion.ul variants={listVariants} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

---

## Accessibility

### Keyboard Navigation

```typescript
// components/AccessibleButton.tsx
export function AccessibleButton({ onClick, children }: ButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </button>
  );
}
```

### ARIA Labels

```tsx
// Form with proper labels
<form aria-label="Data submission form">
  <Input
    label="Monthly Spending"
    aria-required="true"
    aria-invalid={!!errors.spending}
    aria-describedby={errors.spending ? "spending-error" : undefined}
  />
  {errors.spending && (
    <p id="spending-error" role="alert" className="text-destructive">
      {errors.spending}
    </p>
  )}
</form>
```

### Focus States

```css
/* Visible focus ring for keyboard navigation */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Remove outline for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Support

```tsx
// Live region for status updates
<div role="status" aria-live="polite" aria-atomic="true">
  {isLoading && "Loading encrypted data..."}
  {error && `Error: ${error.message}`}
  {success && "Data submitted successfully"}
</div>
```

---

## Dark Mode Support

### Color Scheme Toggle

```typescript
// hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored as 'light' | 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return { theme, toggleTheme };
}
```

### CSS Variables for Dark Mode

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  /* ... other light mode colors */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... other dark mode colors */
}
```

### Theme Toggle Component

```tsx
// components/ThemeToggle.tsx
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-accent transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
```

---

## Performance Optimizations

### CSS Containment

```css
/* Isolate components for better paint performance */
.card {
  contain: layout style paint;
}
```

### Hardware Acceleration

```css
/* Use GPU for transforms and animations */
.animated-element {
  transform: translateZ(0);
  will-change: transform, opacity;
}

/* Remove will-change after animation completes */
.animated-element.animation-complete {
  will-change: auto;
}
```

### Lazy Loading Images

```tsx
// components/LazyImage.tsx
export function LazyImage({ src, alt, ...props }: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
```

---

## Component Examples

### Complete Data Submission Form

```tsx
// components/DataSubmissionForm.tsx
export function DataSubmissionForm() {
  const [spending, setSpending] = useState('');
  const [rides, setRides] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Encryption and submission logic
      await submitEncryptedData(spending, rides);
      setToast({
        type: 'success',
        message: 'Data submitted successfully',
        onClose: () => setToast(null)
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message,
        onClose: () => setToast(null)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card variant="glass" className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold">Submit Transit Data</h2>

          <Input
            label="Monthly Spending (cents)"
            type="number"
            value={spending}
            onChange={(e) => setSpending(e.target.value)}
            placeholder="500"
            icon={<DollarSign />}
            required
          />

          <Input
            label="Number of Rides"
            type="number"
            value={rides}
            onChange={(e) => setRides(e.target.value)}
            placeholder="10"
            icon={<Ticket />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Submit Encrypted Data
          </Button>

          <p className="text-sm text-muted-foreground">
            Your data is encrypted using FHE before submission
          </p>
        </form>
      </Card>

      {toast && <Toast {...toast} />}
    </>
  );
}
```

---

## Best Practices

### Component Organization

```
components/
├── ui/              # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Toast.tsx
├── features/        # Feature-specific components
│   ├── DataSubmission/
│   └── Analytics/
└── layouts/         # Page layouts
    ├── Header.tsx
    └── Footer.tsx
```

### Naming Conventions

- **Components**: PascalCase (Button, DataSubmissionForm)
- **Hooks**: camelCase with `use` prefix (useFhevm, useTheme)
- **CSS Classes**: kebab-case (glass-card, gradient-border)
- **CSS Variables**: kebab-case with `--` prefix (--primary-500, --glass-bg)

### Code Quality

```typescript
// Always export types
export interface ButtonProps {
  variant?: 'default' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

// Use const assertions for fixed values
const SIZES = {
  sm: 'h-9 px-3',
  md: 'h-11 px-6',
  lg: 'h-13 px-8'
} as const;

// Destructure props for clarity
export function Button({ variant = 'default', size = 'md', ...props }: ButtonProps) {
  // Implementation
}
```

---

## Testing UI Components

### Visual Regression Testing

```typescript
// Button.test.tsx
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders primary variant correctly', () => {
    const { container } = render(
      <Button variant="primary">Click me</Button>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('shows loading state', () => {
    const { getByRole } = render(
      <Button isLoading>Submit</Button>
    );
    expect(getByRole('button')).toBeDisabled();
  });
});
```

### Accessibility Testing

```typescript
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<DataSubmissionForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Conclusion

This UI/UX implementation guide covers:

✅ Complete design system with colors, typography, spacing
✅ Comprehensive component library with glassmorphism effects
✅ Responsive design patterns for all screen sizes
✅ Animation system with CSS and React Spring
✅ WCAG 2.1 AA accessibility compliance
✅ Dark mode support with theme toggle
✅ Performance optimizations (hardware acceleration, lazy loading)
✅ Testing strategies for visual regression and accessibility

All components follow modern web standards and are production-ready for the Transit Analytics platform.
