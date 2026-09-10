type P = { className?: string }
const base = 'h-4 w-4'
const s = (c?: string) => `${base} ${c ?? ''}`

export const Pin = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={s(className)}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.8" />
  </svg>
)

export const Cal = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={s(className)}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
  </svg>
)

export const Clock = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={s(className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Star = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={s(className)}>
    <path d="m12 3.6 2.6 5.3 5.9.86-4.25 4.14 1 5.85L12 16.99l-5.25 2.76 1-5.85-4.25-4.14 5.9-.86L12 3.6Z" />
  </svg>
)

export const Arrow = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={s(className)}>
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Search = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={s(className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" strokeLinecap="round" />
  </svg>
)

export const Ticket = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={s(className)}>
    <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a2.5 2.5 0 0 0 0-5V8Z" />
    <path d="M13 6v12" strokeDasharray="2 2.6" strokeLinecap="round" />
  </svg>
)

export const Menu = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={s(className)}>
    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
  </svg>
)

export const Close = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={s(className)}>
    <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
)

export const Check = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={s(className)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Shield = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={s(className)}>
    <path d="M12 3l7.5 3v6c0 4.6-3.2 8-7.5 9-4.3-1-7.5-4.4-7.5-9V6L12 3Z" strokeLinejoin="round" />
    <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Bolt = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={s(className)}>
    <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" strokeLinejoin="round" />
  </svg>
)

export const Phone = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={s(className)}>
    <path d="M4.5 5.5c0-1 .8-1.8 1.8-1.8h1.9c.8 0 1.5.6 1.7 1.4l.6 2.6c.1.7-.1 1.4-.7 1.8l-1.3 1a12.5 12.5 0 0 0 5 5l1-1.3c.4-.6 1.1-.8 1.8-.7l2.6.6c.8.2 1.4.9 1.4 1.7v1.9c0 1-.8 1.8-1.8 1.8C10.6 19.8 4.5 13.7 4.5 5.5Z" />
  </svg>
)

export const Insta = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={s(className)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

export const Facebook = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={s(className)}>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.41-.12-2.38 0-4.01 1.45-4.01 4.12v2.3H7.6V13h2.68v8h3.22Z" />
  </svg>
)

export const YouTube = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={s(className)}>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.78C18.28 5 12 5 12 5s-6.28 0-7.84.42A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.78C5.72 19 12 19 12 19s6.28 0 7.84-.42a2.5 2.5 0 0 0 1.76-1.78A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8l5.2 3.2-5.2 3.2Z" />
  </svg>
)
