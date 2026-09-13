import { Delete } from 'lucide-react';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0'];

export function PinPad({ value = '', onChange, max = 6, label }) {
  function press(digit) {
    if (value.length >= max) return;
    onChange(`${value}${digit}`);
  }

  function backspace() {
    onChange(value.slice(0, -1));
  }

  return (
    <div className="w-full">
      {label ? (
        <p className="mb-2 text-center text-[11px] font-bold tracking-[0.12em] text-slate-500 dark:text-slate-300">
          {label}
        </p>
      ) : null}

      <div className="mb-2 flex justify-center gap-2" dir="ltr">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full border ${
              i < value.length
                ? 'border-blue-600 bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                : 'border-slate-300 bg-transparent dark:border-slate-600'
            }`}
          />
        ))}
      </div>

      <p className="mb-3 text-center text-[10px] font-semibold text-slate-400" dir="ltr">
        {value.length} / {max}
      </p>

      <div className="mx-auto grid max-w-[220px] grid-cols-3 gap-2.5" dir="ltr">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-extrabold text-slate-800 shadow-[0_8px_16px_rgba(15,23,42,0.04)] transition active:scale-[0.98] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={() => (key === 'back' ? backspace() : press(key))}
          >
            {key === 'back' ? <Delete size={18} /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}
