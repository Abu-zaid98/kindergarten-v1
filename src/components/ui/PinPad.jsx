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
        <p className="mb-3 text-center text-[13px] font-bold tracking-[0.12em] text-slate-500 dark:text-slate-300">
          {label}
        </p>
      ) : null}

      <div className="mb-3 flex justify-center gap-3" dir="ltr">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full border ${i < value.length
                ? 'border-blue-600 bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.15)]'
                : 'border-slate-300 bg-transparent dark:border-slate-600'
              }`}
          />
        ))}
      </div>

      <p className="mb-4 text-center text-[12px] font-semibold text-slate-400" dir="ltr">
        {value.length} / {max}
      </p>

      <div className="mx-auto grid max-w-[280px] grid-cols-3 gap-3" dir="ltr">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-extrabold text-slate-800 shadow-[0_8px_16px_rgba(15,23,42,0.04)] transition active:scale-[0.98] hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            onClick={() => (key === 'back' ? backspace() : press(key))}
          >
            {key === 'back' ? (
              <svg
                aria-label="Delete"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
                <path d="m18 9-6 6" />
                <path d="m12 9 6 6" />
              </svg>
            ) : key}
          </button>
        ))}
      </div>
    </div>
  );
}
