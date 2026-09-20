import { useEffect, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { ARABIC_MONTHS, yearsAround } from '../../utils/dates';
import { Button } from './Button';
import { useAppStore } from '../../store/appStore';
import { useSettings } from '../../hooks/useAuth';

export function PeriodFilter({
  withSearch = false,
  showMonth = true,
  showYear = true,
}) {
  const selectedMonth = useAppStore((s) => s.selectedMonth);
  const selectedYear = useAppStore((s) => s.selectedYear);
  const setPeriod = useAppStore((s) => s.setPeriod);
  const settings = useSettings();
  const [draftMonth, setDraftMonth] = useState(Number(selectedMonth));
  const [draftYear, setDraftYear] = useState(Number(selectedYear));
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  useEffect(() => {
    setDraftMonth(Number(selectedMonth));
    setDraftYear(Number(selectedYear));
  }, [selectedMonth, selectedYear]);

  const workingMonths = Array.isArray(settings?.workingMonths) && settings.workingMonths.length ? settings.workingMonths.map(Number).sort((a, b) => a - b) : ARABIC_MONTHS.map((_, index) => index + 1);
  const month = withSearch ? draftMonth : Number(selectedMonth);
  const year = withSearch ? draftYear : Number(selectedYear);
  const yearOptions = yearsAround(Number(selectedYear) || new Date().getFullYear());

  function onMonthSelect(value) {
    if (withSearch) setDraftMonth(value);
    else setPeriod(value, Number(selectedYear));
    setMonthOpen(false);
  }

  function onYearSelect(value) {
    if (withSearch) setDraftYear(value);
    else setPeriod(Number(selectedMonth), value);
    setYearOpen(false);
  }

  const cols = (showMonth ? 1 : 0) + (showYear ? 1 : 0) + (withSearch ? 1 : 0);

  return (
    <div className={`grid gap-2 ${cols >= 3 ? 'grid-cols-2 sm:grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {showMonth ? (
        <div className="relative block">
          <span className="mb-1.5 block text-sm font-bold text-slate-600">الشهر</span>
          <button
            type="button"
            onClick={() => {
              setMonthOpen((v) => !v);
              setYearOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-right text-sm font-bold text-slate-700 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <span>{ARABIC_MONTHS[(month || 1) - 1] || ARABIC_MONTHS[0]}</span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {monthOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-60 overflow-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
              {workingMonths.map((value) => {
                const name = ARABIC_MONTHS[value - 1];
                return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onMonthSelect(value)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-sm font-bold ${month === value ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>{name}</span>
                  {month === value ? <span className="text-xs">✓</span> : null}
                </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {showYear ? (
        <div className="relative block">
          <span className="mb-1.5 block text-sm font-bold text-slate-600">السنة</span>
          <button
            type="button"
            onClick={() => {
              setYearOpen((v) => !v);
              setMonthOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-right text-sm font-bold text-slate-700 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <span>{String(year)}</span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {yearOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-60 overflow-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
              {yearOptions.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => onYearSelect(Number(y))}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-sm font-bold ${year === Number(y) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>{String(y)}</span>
                  {year === Number(y) ? <span className="text-xs">✓</span> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {withSearch ? (
        <Button className="self-end w-full" onClick={() => setPeriod(Number(draftMonth), Number(draftYear))}>
          <Search size={16} />
          بحث
        </Button>
      ) : null}
    </div>
  );
}
