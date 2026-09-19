import { createElement, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Shapes } from 'lucide-react'
import { cx } from '../lib/format'
import { categoryIcon } from './cityIcons'

type Item = { name: string; count: number }

/** Category picker for the listings toolbar — the dropdown that used to live in the nav. */
export function CategoryDropdown({
  items,
  total,
  active,
  onChange,
}: {
  items: Item[]
  total: number
  active: string
  onChange: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (name: string) => {
    onChange(name)
    setOpen(false)
  }

  const selected = active !== 'All'
  const options = [{ name: 'All', count: total }, ...items]

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          'group inline-flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border pl-2 pr-3 text-sm font-semibold transition-all duration-150 sm:w-auto',
          selected
            ? 'border-blue bg-blue text-white shadow-md shadow-blue/25 hover:bg-blue-dark'
            : 'border-line bg-white text-ink hover:border-blue/40 hover:shadow-md',
        )}
      >
        <span
          className={cx(
            'grid h-7 w-7 place-items-center rounded-md',
            selected ? 'bg-white/20 text-white' : 'bg-blue-light text-blue',
          )}
        >
          {createElement(selected ? categoryIcon(active) : Shapes, { className: 'h-4 w-4' })}
        </span>
        <span className="flex-1 text-left">{selected ? active : 'All categories'}</span>
        <ChevronDown
          className={cx('h-4 w-4 transition-transform duration-150', open && 'rotate-180', selected ? 'text-white' : 'text-faint')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Categories"
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-40 mt-2 w-full min-w-64 rounded-xl border border-line bg-white p-2 shadow-md sm:w-64"
          >
            {options.map(({ name, count }) => {
              const on = active === name
              return (
                <li key={name}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => choose(name)}
                    className={cx(
                      'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150',
                      on ? 'bg-blue-light font-medium text-blue' : 'text-ink hover:bg-surface',
                    )}
                  >
                    {createElement(name === 'All' ? Shapes : categoryIcon(name), {
                      className: cx('h-4 w-4 shrink-0', on ? 'text-blue' : 'text-faint'),
                    })}
                    <span className="flex-1">{name === 'All' ? 'All categories' : name}</span>
                    {on ? <Check className="h-4 w-4" /> : <span className="text-xs text-faint">{count}</span>}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
