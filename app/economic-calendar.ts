import type {Event} from './model';

type TradingViewEvent = {
 id: string;
 country: string;
 date: string;
 title: string;
 period?: string;
 importance: number;
 actual?: number | null;
 forecast?: number | null;
 previous?: number | null;
 unit?: string;
 scale?: string;
 source?: string;
};

export function normalizeTradingView(rows: TradingViewEvent[], from: Date, to: Date): Event[] {
 const events = new Map<string, Event>();
 for (const row of rows) {
  if (row?.country !== 'US' || ![0, 1].includes(row.importance) || !row.id || !row.title) continue;
  const time = Date.parse(row.date);
  if (!Number.isFinite(time) || time < +from || time >= +to) continue;
  const suffix = row.scale || (row.unit === '%' ? '%' : '');
  const format = (value: number | null | undefined) =>
   typeof value === 'number' && Number.isFinite(value) ? String(value) + suffix : '';
  const id = 'tv-' + row.id;
  events.set(id, {
   id,
   date: new Date(time).toISOString(),
   name: row.title + (row.period ? ' · ' + row.period : ''),
   importance: row.importance + 2,
   actual: format(row.actual),
   forecast: format(row.forecast),
   previous: format(row.previous),
   source: row.source ? 'TradingView · ' + row.source : 'TradingView',
   sourceURL: 'https://www.tradingview.com/economic-calendar/',
  });
 }
 return [...events.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

export function rangeValid(start:string|null,end:string|null){return !!start&&!!end&&/^\d{4}-\d{2}-\d{2}$/.test(start)&&/^\d{4}-\d{2}-\d{2}$/.test(end)&&Number.isFinite(+new Date(start))&&Number.isFinite(+new Date(end))&&+new Date(end)>=+new Date(start)&&+new Date(end)-+new Date(start)<=6*86400000}
