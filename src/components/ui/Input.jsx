import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export function Input({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-sm font-bold text-slate-600">{label}</span> : null}
      <input
        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Select({ label, children, className = '', ...props }) {
  const { value, onChange, disabled = false, ...buttonProps } = props;
  const options = Array.isArray(children) ? children : [children];
  const selectedOption = options.find((option) => String(option?.props?.value) === String(value)) || options[0];
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function selectOption(option) {
    if (option?.props?.disabled) return;
    onChange?.({ target: { value: option.props.value } });
    setOpen(false);
  }

  return (
    <label ref={containerRef} className={`relative block ${className}`}>
      {label ? <span className="mb-1.5 block text-sm font-bold text-slate-600">{label}</span> : null}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-right text-sm font-medium text-slate-700 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        {...buttonProps}
      >
        <span>{selectedOption?.props?.children}</span>
        <ChevronDown size={17} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
          {options.map((option) => {
            const optionValue = option?.props?.value;
            const isSelected = String(optionValue) === String(value);
            return (
              <button
                key={String(optionValue)}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option?.props?.disabled}
                onClick={() => selectOption(option)}
                className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2 text-right text-sm font-bold transition ${
                  isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span>{option?.props?.children}</span>
                {isSelected ? <Check size={16} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </label>
  );
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-sm font-bold text-slate-600">{label}</span> : null}
      <textarea
        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        rows={3}
        {...props}
      />
    </label>
  );
}
