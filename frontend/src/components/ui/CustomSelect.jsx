
import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  ariaLabel,
  className = '',
  disabled = false,
}) {
  const generatedId = useId()
  const selectId = id || generatedId

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])

  const selectedIndex = options.findIndex(
    (option) => option.value === value
  )

  const selectedOption = options[selectedIndex]

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    if (open) {
      optionRefs.current[activeIndex]?.scrollIntoView({
        block: 'nearest',
      })
    }
  }, [open, activeIndex])

  const openMenu = () => {
    if (disabled) return

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen((current) => !current)
  }

  const selectOption = (option) => {
    onChange(option.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const handleKeyDown = (event) => {
    if (disabled) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()

      if (!open) {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
        setOpen(true)
        return
      }

      setActiveIndex((current) =>
        Math.min(current + 1, options.length - 1)
      )
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()

      if (!open) {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
        setOpen(true)
        return
      }

      setActiveIndex((current) => Math.max(current - 1, 0))
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (!open) {
        event.preventDefault()
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
        setOpen(true)
      } else {
        event.preventDefault()
        if (options[activeIndex]) {
          selectOption(options[activeIndex])
        }
      }
    }

    if (event.key === 'Home' && open) {
      event.preventDefault()
      setActiveIndex(0)
    }

    if (event.key === 'End' && open) {
      event.preventDefault()
      setActiveIndex(options.length - 1)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${selectId}-options`}
        onClick={openMenu}
        onKeyDown={handleKeyDown}
        className={`
          group flex w-full items-center justify-between gap-3
          rounded-xl border px-3.5 py-2.5 text-left text-sm
          transition-all duration-200
          ${
            open
              ? 'border-cyan-400/70 bg-space-900 shadow-[0_0_0_3px_rgba(34,211,238,0.08)]'
              : 'border-space-600 bg-space-950/60 hover:border-cyan-400/40 hover:bg-space-900/80'
          }
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          focus:outline-none focus-visible:border-cyan-400
          focus-visible:ring-2 focus-visible:ring-cyan-400/20
        `}
      >
        <span
          className={`truncate ${
            selectedOption ? 'text-ink-100' : 'text-ink-500'
          }`}
        >
          {selectedOption?.label || placeholder}
        </span>

        <ChevronDown
          size={17}
          className={`
            shrink-0 text-cyan-400 transition-transform duration-200
            ${open ? 'rotate-180' : ''}
          `}
        />
      </button>

      <div
        className={`
          absolute left-0 right-0 top-[calc(100%+8px)] z-50
          origin-top overflow-hidden rounded-xl
          border border-space-700 bg-space-900
          shadow-[0_16px_40px_rgba(0,0,0,0.45)]
          transition-all duration-200 ease-out
          ${
            open
              ? 'visible translate-y-0 scale-100 opacity-100'
              : 'invisible -translate-y-2 scale-[0.98] opacity-0 pointer-events-none'
          }
        `}
      >
        <div
          id={`${selectId}-options`}
          role="listbox"
          aria-label={ariaLabel || placeholder}
          className="max-h-64 overflow-y-auto p-1.5"
        >
          {options.map((option, index) => {
            const selected = option.value === value
            const active = index === activeIndex

            return (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element
                }}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`
                  flex w-full items-center justify-between gap-3
                  rounded-lg px-3 py-2.5 text-left text-sm
                  transition-colors duration-150
                  ${
                    selected
                      ? 'bg-cyan-400/10 text-cyan-300'
                      : active
                        ? 'bg-space-800 text-ink-100'
                        : 'text-ink-300 hover:bg-space-800 hover:text-ink-100'
                  }
                `}
              >
                <span className="truncate">{option.label}</span>

                {selected && (
                  <Check
                    size={16}
                    className="shrink-0 text-cyan-400"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
