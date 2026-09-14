import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cx } from '../lib/format'

/* ---------------------------------------------------------------- Reveal */

export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px -5% 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ---------------------------------------------------------------- Button */

type ButtonProps = {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

const sizes = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-12 px-7 text-[15px]',
}

const variants = {
  primary: 'bg-blue hover:bg-blue-dark text-white font-semibold shadow-xs transition-colors',
  outline: 'bg-white border border-line text-cream hover:bg-surface-2 hover:border-gray-300 font-semibold shadow-xs transition-colors',
  secondary: 'bg-blue-light text-blue hover:bg-blue/15 font-semibold transition-colors',
  ghost: 'text-muted font-medium hover:text-cream hover:bg-surface-2 transition-colors',
}

export function Button({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled,
}: ButtonProps) {
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap',
    'transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
    sizes[size],
    variants[variant],
    className,
  )

  if (to) return <Link to={to} className={cls}>{children}</Link>
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    )
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}

/* --------------------------------------------------------------- Eyebrow */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-blue',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-blue" />
      {children}
    </span>
  )
}

/* -------------------------------------------------------- Section header */

export function SectionHead({
  eyebrow,
  title,
  accent,
  blurb,
  action,
}: {
  eyebrow?: string
  title: string
  accent?: string
  blurb?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h2 className="text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold tracking-tight text-cream">
          {title}{' '}
          {accent && <span className="text-blue">{accent}</span>}
        </h2>
        {blurb && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">{blurb}</p>}
      </div>
      {action}
    </div>
  )
}

/* ------------------------------------------------------------------ Chip */

export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-150 cursor-pointer',
        active
          ? 'bg-blue-light text-blue border border-blue shadow-xs font-semibold'
          : 'bg-white text-muted border border-line hover:border-gray-300 hover:text-cream',
      )}
    >
      {children}
    </button>
  )
}

/* ----------------------------------------------------------------- Badge */

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'mint' | 'ember' | 'gold' | 'blue' | 'violet' | 'cyan'
}) {
  const tones = {
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
    blue: 'bg-blue-light text-blue font-bold border border-blue/20',
    violet: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    cyan: 'bg-sky-50 text-sky-700 border border-sky-200',
    mint: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    ember: 'bg-rose-50 text-rose-700 border border-rose-200',
    gold: 'bg-amber-50 text-amber-700 border border-amber-200',
  }
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em]',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
