import {normalizeInvesting} from '../investing';
class InvestingError extends Error {code:string;constructor(message:string,code:string){super(message);this.code=code}}
const cache=new Map<string,{events:ReturnType<typeof normalizeInvesting>;updated:string;expires:number}>();
const pending=new Map<string,Promise<{events:ReturnType<typeof normalizeInvesting>;updated:string;expires:number}>>();
async function collect(start:string,end:string){
 let cursor:string|undefined;const merged:{events:any[];occurrences:any[]}={events:[],occurrences:[]};
 for(let page=0;page<5;page++){
 const u=new URL('https://endpoints.investing.com/pd-instruments/v1/calendars/economic/events/occurrences');
 Object.entries({domain_id:'1',limit:'200',start_date:new Date(start+'T00:00:00+09:00').toISOString(),end_date:new Date(end+'T23:59:59.999+09:00').toISOString(),country_ids:'5',importance:'medium,high'}).forEach(([k,v])=>u.searchParams.set(k,v));
 if(cursor)u.searchParams.set('cursor',cursor);
 const r=await fetch(u,{signal:AbortSignal.timeout(20000),headers:{Accept:'application/json'}});
 if(!r.ok)throw new InvestingError(r.status===403||r.status===429?'인베스팅에서 자동 수집 요청을 제한했습니다. 잠시 후 다시 확인해 주세요.':'인베스팅 응답 오류 ('+r.status+').','UPSTREAM_HTTP');
 const body=await r.text();
 if(/^\s*</.test(body))throw new InvestingError('인베스팅이 데이터 대신 웹페이지를 반환했습니다. 제공사의 일시적인 응답 제한일 수 있습니다.','UPSTREAM_HTML');
 let data:any;try{data=JSON.parse(body)}catch{throw new InvestingError('인베스팅 응답 형식이 변경되었거나 일시적으로 올바르지 않습니다.','UPSTREAM_FORMAT')};
 if(!Array.isArray(data.events)||!Array.isArray(data.occurrences))throw Error('인베스팅 데이터 형식이 변경되었습니다.');
 merged.events.push(...data.events);merged.occurrences.push(...data.occurrences);cursor=data.next_page_cursor;if(!cursor)break;
 }
 if(cursor)throw Error('조회 결과가 너무 많아 전체 수집을 완료하지 못했습니다.');
 return {events:normalizeInvesting(merged,start,end),updated:new Date().toISOString(),expires:Date.now()+300000};
}

export async function getInvestingCalendar(start:string,end:string){
 const key=start+':'+end,old=cache.get(key);if(old&&old.expires>Date.now())return {...old,provider:'Investing.com',cached:true};
 try{let promise=pending.get(key);if(!promise){promise=collect(start,end);pending.set(key,promise)}const data=await promise;cache.set(key,data);if(cache.size>30)cache.delete(cache.keys().next().value!);return {...data,provider:'Investing.com',cached:false}}finally{pending.delete(key)}
}
export function investingFailure(error:unknown){
 if(error instanceof InvestingError)return {error:error.message,code:error.code};
 if(error instanceof Error&&(error.name==='TimeoutError'||error.name==='AbortError'))return {error:'인베스팅 응답 시간이 초과되었습니다. 잠시 후 다시 확인해 주세요.',code:'UPSTREAM_TIMEOUT'};
 return {error:'인베스팅 데이터 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',code:'UPSTREAM_ERROR'};
}
