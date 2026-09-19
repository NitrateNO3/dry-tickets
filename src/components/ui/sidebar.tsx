// Adapted from Aceternity UI "Sidebar": https://ui.aceternity.com/components/sidebar
// Local changes for this app:
//  - react-router `Link` instead of next/link, site colour tokens instead of neutral/dark.
//  - The desktop rail reserves only its collapsed width and expands *over* the page on
//    hover/focus, so content beside it never reflows.
//  - `SidebarItem` (a toggle button) and `SidebarSection` for filter-style menus.
//  - The mobile trigger takes a label; the drawer is portalled to <body> (so a blurred or
//    sticky parent can't clip it), locks page scroll and closes on Escape.
import { createContext, useContext, useEffect, useState } from 'react'
import type { ComponentProps, Dispatch, ReactNode, SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPEN_WIDTH = 300
const CLOSED_WIDTH = 64

interface Links {
  label: string
  href: string
  icon: ReactNode
}

interface SidebarContextProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  animate: boolean
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider')
  return context
}

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: ReactNode
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  animate?: boolean
}) => {
  const [openState, setOpenState] = useState(false)
  const open = openProp !== undefined ? openProp : openState
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

  return <SidebarContext.Provider value={{ open, setOpen, animate }}>{children}</SidebarContext.Provider>
}

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: ReactNode
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  animate?: boolean
}) => (
  <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
    {children}
  </SidebarProvider>
)

type BodyProps = ComponentProps<typeof motion.div> & {
  /** Content of the mobile trigger bar (left of the menu icon). */
  mobileTrigger?: ReactNode
  /** Pinned to the bottom of the mobile drawer, e.g. an "Apply" button. */
  mobileFooter?: ReactNode
}

export const SidebarBody = ({ mobileTrigger, mobileFooter, ...props }: BodyProps) => (
  <>
    <DesktopSidebar {...props} />
    <MobileSidebar trigger={mobileTrigger} footer={mobileFooter} className={props.className as string}>
      {props.children as ReactNode}
    </MobileSidebar>
  </>
)

export const DesktopSidebar = ({ className, children, ...props }: ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar()
  return (
    // Placeholder holds the collapsed width in the layout; the panel grows over the content.
    <div
      className="sticky top-16 z-40 hidden h-[calc(100svh-4rem)] shrink-0 self-start md:block"
      style={{ width: animate ? CLOSED_WIDTH : OPEN_WIDTH }}
    >
      <motion.div
        className={cn(
          'absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-line bg-white px-3 py-4',
          animate && open && 'shadow-xl',
          className,
        )}
        initial={false}
        animate={{ width: animate ? (open ? OPEN_WIDTH : CLOSED_WIDTH) : OPEN_WIDTH }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  )
}

export const MobileSidebar = ({
  className,
  children,
  trigger,
  footer,
  ...props
}: ComponentProps<'div'> & { trigger?: ReactNode; footer?: ReactNode }) => {
  const { open, setOpen } = useSidebar()

  useEffect(() => {
    if (!open) return
    // The desktop rail shares `open`, so only lock scroll while the drawer is actually shown.
    const lock = window.matchMedia('(max-width: 767px)').matches
    if (lock) document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      if (lock) document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen])

  return (
    <div
      className="sticky top-16 z-30 flex w-full items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-2 backdrop-blur-md md:hidden"
      {...props}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0 flex-1">{trigger}</span>
        <Menu className="h-5 w-5 shrink-0 text-ink" />
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-0 z-[100] flex h-full w-full flex-col bg-white md:hidden"
            >
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 z-50 grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-line text-ink"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <div className={cn('flex flex-1 flex-col overflow-y-auto p-6 pt-6', className)}>{children}</div>
              {footer && <div className="border-t border-line bg-surface p-4">{footer}</div>}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}

/** Label that fades in with the panel; always shown when animation is off. */
const Label = ({ children, className }: { children: ReactNode; className?: string }) => {
  const { open, animate } = useSidebar()
  return (
    <motion.span
      initial={false}
      animate={{
        display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
        opacity: animate ? (open ? 1 : 0) : 1,
      }}
      className={cn('!m-0 inline-block whitespace-pre !p-0 text-sm transition duration-150', className)}
    >
      {children}
    </motion.span>
  )
}

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links
  className?: string
} & Omit<LinkProps, 'to'>) => (
  <Link to={link.href} className={cn('group/sidebar flex items-center justify-start gap-2 py-2', className)} {...props}>
    {link.icon}
    <Label className="text-muted group-hover/sidebar:translate-x-1">{link.label}</Label>
  </Link>
)

/** A toggle row: icon always visible, label and count when expanded, highlighted when active. */
export const SidebarItem = ({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: ReactNode
  label: string
  count?: number
  active?: boolean
  onClick: () => void
}) => {
  const { open, animate } = useSidebar()
  const expanded = open || !animate
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={expanded ? undefined : label}
      className={cn(
        'group/sidebar flex h-9 w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg px-[10px] text-left transition-colors duration-150',
        active ? 'bg-blue-light text-blue' : 'text-muted hover:bg-surface hover:text-ink',
      )}
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
      <Label className={cn('min-w-0 flex-1 truncate', active ? 'font-semibold' : 'font-medium group-hover/sidebar:translate-x-0.5')}>
        {label}
      </Label>
      {count !== undefined && expanded && (
        <span className={cn('text-xs tabular-nums', active ? 'text-blue' : 'text-faint')}>{count}</span>
      )}
    </button>
  )
}

/** Titled group; collapses to a hairline divider when the rail is closed. */
export const SidebarSection = ({ title, children }: { title: string; children: ReactNode }) => {
  const { open, animate } = useSidebar()
  const expanded = open || !animate
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex h-8 shrink-0 items-center px-[10px]">
        {expanded ? (
          <span className="t-label truncate whitespace-nowrap text-faint">{title}</span>
        ) : (
          <span className="h-px w-5 bg-line" />
        )}
      </div>
      {children}
    </div>
  )
}
