import {normalizeTradingView} from '../economic-calendar';

class TradingViewError extends Error {
 constructor(message: string, readonly code: string, readonly retryAfter?: number) {
  super(message);
 }
}

type CalendarData = {events: ReturnType<typeof normalizeTradingView>; updated: string; expires: number};
let rejection: {error: TradingViewError; until: number} | undefined;
const cache = new Map<string, CalendarData>();
const pending = new Map<string, Promise<CalendarData>>();

async function collect(start: string, end: string): Promise<CalendarData> {
 const from = new Date(start + 'T00:00:00+09:00');
 const to = new Date(+new Date(end + 'T00:00:00+09:00') + 86_400_000);
 const url = new URL('https://economic-calendar.tradingview.com/events');
 url.search = new URLSearchParams({from: from.toISOString(), to: to.toISOString(), countries: 'US'}).toString();
 const response = await fetch(url, {
  cache: 'no-store',
  signal: AbortSignal.timeout(15_000),
  headers: {Accept: 'application/json', Origin: 'https://www.tradingview.com'},
 });
 if (response.status === 403 || response.status === 429) {
  const limited = response.status === 429;
  const seconds = limited ? Math.min(3600, Math.max(60, Number(response.headers.get('retry-after')) || 300)) : 900;
  const error = new TradingViewError(
   'TradingView 데이터 요청이 제한되었습니다 (' + response.status + '). 잠시 후 다시 확인해 주세요.',
   limited ? 'UPSTREAM_RATE_LIMIT' : 'UPSTREAM_FORBIDDEN',
   seconds,
  );
  rejection = {error, until: Date.now() + seconds * 1000};
  throw error;
 }
 if (!response.ok) throw new TradingViewError('TradingView 응답 오류 (' + response.status + ').', 'UPSTREAM_HTTP');
 const body = await response.text();
 if (/^\s*</.test(body)) throw new TradingViewError('TradingView가 데이터 대신 웹페이지를 반환했습니다.', 'UPSTREAM_HTML');
 let data;
 try { data = JSON.parse(body); } catch { /* Handled by the response shape check. */ }
 if (data?.status !== 'ok' || !Array.isArray(data.result)) {
  throw new TradingViewError('TradingView 응답 형식을 확인할 수 없습니다.', 'UPSTREAM_FORMAT');
 }
 return {events: normalizeTradingView(data.result, from, to), updated: new Date().toISOString(), expires: Date.now() + 300_000};
}

export async function getTradingViewCalendar(start:string,end:string){
 const key=start+':'+end,old=cache.get(key);if(old&&old.expires>Date.now())return {...old,provider:'TradingView',cached:true};
 if(rejection&&rejection.until>Date.now())throw rejection.error;
 try{let promise=pending.get(key);if(!promise){promise=collect(start,end);pending.set(key,promise)}const data=await promise;cache.set(key,data);if(cache.size>30)cache.delete(cache.keys().next().value!);return {...data,provider:'TradingView',cached:false}}finally{pending.delete(key)}
}
export function tradingViewFailure(error:unknown){
 if(error instanceof TradingViewError)return {error:error.message,code:error.code,...(error.retryAfter?{retryAfter:error.retryAfter}:{})};
 if(error instanceof Error&&(error.name==='TimeoutError'||error.name==='AbortError'))return {error:'TradingView 응답 시간이 초과되었습니다. 잠시 후 다시 확인해 주세요.',code:'UPSTREAM_TIMEOUT'};
 return {error:'TradingView 데이터 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',code:'UPSTREAM_ERROR'};
}
