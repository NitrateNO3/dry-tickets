import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cx } from '../lib/format'

/* ---------------------------------------------------------------- Reveal */

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px -8% 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
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
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

const sizes = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-[15px]',
}

const variants = {
  primary: 'accent-bg text-ink font-bold shine hover:brightness-108 shadow-[0_8px_30px_-10px_rgba(255,120,60,0.7)]',
  outline: 'hairline text-cream font-semibold hover:bg-surface hover:border-cream/25',
  ghost: 'text-muted font-semibold hover:text-cream hover:bg-surface',
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
    'transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
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
        'inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-saffron',
        className,
      )}
    >
      <span className="h-px w-6 bg-saffron/50" />
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
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h2 className="text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold">
          {title}{' '}
          {accent && <em className="font-serif font-normal not-italic text-gradient italic">{accent}</em>}
        </h2>
        {blurb && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{blurb}</p>}
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
        'shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200',
        active
          ? 'bg-cream text-ink shadow-[0_4px_18px_-6px_rgba(246,242,234,0.5)]'
          : 'hairline text-muted hover:border-cream/25 hover:text-cream',
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
  tone?: 'neutral' | 'mint' | 'ember' | 'gold'
}) {
  const tones = {
    neutral: 'bg-cream/10 text-cream/85',
    mint: 'bg-mint/15 text-mint',
    ember: 'bg-ember/15 text-ember',
    gold: 'bg-gold/15 text-gold',
  }
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
