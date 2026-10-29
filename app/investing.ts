import type {Event} from './model';
type Raw={events:Record<string,any>[];occurrences:Record<string,any>[];next_page_cursor?:string};
export function normalizeInvesting(raw:Raw,start:string,end:string):Event[]{
 if(!Array.isArray(raw.events)||!Array.isArray(raw.occurrences))throw Error('인베스팅 데이터 형식이 변경되었습니다.');
 const meta=new Map(raw.events.map(e=>[e.event_id,e]));
 const min=+new Date(start+'T00:00:00+09:00'),max=+new Date(end+'T23:59:59.999+09:00');
 const out:Event[]=[];
 for(const o of raw.occurrences){const e=meta.get(o.event_id);if(!e||e.country_id!==5||!['medium','high'].includes(e.importance))continue;
 const time=Date.parse(o.occurrence_time);if(!Number.isFinite(time)||time<min||time>max)continue;
 const fmt=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v.toFixed(Math.min(6,Math.max(0,Number(o.precision)||0)))+(o.unit||''):'';
 const name=String(e.short_name||e.long_name||e.event_translated||'')+(e.event_cycle_suffix?' ('+e.event_cycle_suffix+')':'')+(o.reference_period?' · '+o.reference_period:'');
 out.push({id:'inv-'+o.occurrence_id,date:new Date(time).toISOString(),name,importance:e.importance==='high'?3:2,actual:fmt(o.actual),forecast:fmt(o.forecast),previous:fmt(o.previous),revised:fmt(o.previous_revised_from),eventType:e.event_type,source:'Investing.com · '+(e.source||'경제 캘린더'),sourceURL:typeof e.page_link==='string'&&e.page_link.startsWith('/economic-calendar/')?'https://www.investing.com'+e.page_link:'https://www.investing.com/economic-calendar'});
 }
 return [...new Map(out.map(e=>[e.id,e])).values()].sort((a,b)=>+new Date(a.date)-+new Date(b.date));
}
export function rangeValid(start:string|null,end:string|null){return !!start&&!!end&&/^\d{4}-\d{2}-\d{2}$/.test(start)&&/^\d{4}-\d{2}-\d{2}$/.test(end)&&Number.isFinite(+new Date(start))&&Number.isFinite(+new Date(end))&&+new Date(end)>=+new Date(start)&&+new Date(end)-+new Date(start)<=6*86400000}
