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
    <div>
      {label ? <p className="mb-3 text-center text-sm font-bold text-slate-600">{label}</p> : null}
      <div className="mb-2 flex justify-center gap-2" dir="ltr">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border ${
              i < value.length
                ? 'border-blue-600 bg-blue-600'
                : 'border-slate-300 bg-transparent dark:border-neutral-600'
            }`}
          />
        ))}
      </div>
      <p className="mb-4 text-center text-xs text-slate-400" dir="ltr">
        {value.length} / {max}
      </p>
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-2" dir="ltr">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl font-extrabold text-slate-800 hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => (key === 'back' ? backspace() : press(key))}
          >
            {key === 'back' ? <Delete size={22} /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}
