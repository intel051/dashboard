import {normalizeInvesting} from '../investing';
class InvestingError extends Error {code:string;retryAfter?:number;constructor(message:string,code:string,retryAfter?:number){super(message);this.code=code;this.retryAfter=retryAfter}}
// Stop repeated requests across dates after a provider rejection (per server instance).
let rejection:{error:InvestingError;until:number}|undefined;
const cache=new Map<string,{events:ReturnType<typeof normalizeInvesting>;updated:string;expires:number}>();
const pending=new Map<string,Promise<{events:ReturnType<typeof normalizeInvesting>;updated:string;expires:number}>>();
async function collect(start:string,end:string){
 let cursor:string|undefined;const merged:{events:any[];occurrences:any[]}={events:[],occurrences:[]};
 for(let page=0;page<5;page++){
 const u=new URL('https://endpoints.investing.com/pd-instruments/v1/calendars/economic/events/occurrences');
 Object.entries({domain_id:'1',limit:'200',start_date:new Date(start+'T00:00:00+09:00').toISOString(),end_date:new Date(end+'T23:59:59.999+09:00').toISOString(),country_ids:'5',importance:'medium,high'}).forEach(([k,v])=>u.searchParams.set(k,v));
 if(cursor)u.searchParams.set('cursor',cursor);
 const r=await fetch(u,{signal:AbortSignal.timeout(20000),headers:{Accept:'application/json'}});
 const body=await r.text();
 if(r.status===403){
  let signatureBlocked=false;try{const problem=JSON.parse(body);signatureBlocked=problem.error_code===1010||problem.error_name==='browser_signature_banned'}catch{}
  const error=new InvestingError(signatureBlocked?'인베스팅이 서버의 자동 수집 요청을 차단했습니다 (403 / 1010). 브라우저에서 원문이 열려도 서버 수집은 별도로 거부될 수 있습니다. 원문 확인·직접 입력 또는 권한 있는 데이터 API를 이용해 주세요.':'인베스팅이 서버의 데이터 요청을 거부했습니다 (403). 자동 갱신을 중지했습니다. 원문 또는 다른 데이터 연결을 확인해 주세요.',signatureBlocked?'UPSTREAM_BLOCKED':'UPSTREAM_FORBIDDEN',900);
  rejection={error,until:Date.now()+900000};throw error;
 }
 if(r.status===429){const seconds=Math.min(3600,Math.max(60,Number(r.headers.get('retry-after'))||300));const error=new InvestingError('인베스팅 요청 한도에 도달했습니다 (429). 자동 갱신을 중지했습니다. 잠시 후 수동으로 다시 확인해 주세요.','UPSTREAM_RATE_LIMIT',seconds);rejection={error,until:Date.now()+seconds*1000};throw error}
 if(!r.ok)throw new InvestingError('인베스팅 응답 오류 ('+r.status+').','UPSTREAM_HTTP');
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
 if(rejection&&rejection.until>Date.now())throw rejection.error;
 try{let promise=pending.get(key);if(!promise){promise=collect(start,end);pending.set(key,promise)}const data=await promise;cache.set(key,data);if(cache.size>30)cache.delete(cache.keys().next().value!);return {...data,provider:'Investing.com',cached:false}}finally{pending.delete(key)}
}
export function investingFailure(error:unknown){
 if(error instanceof InvestingError)return {error:error.message,code:error.code,...(error.retryAfter?{retryAfter:error.retryAfter}:{})};
 if(error instanceof Error&&(error.name==='TimeoutError'||error.name==='AbortError'))return {error:'인베스팅 응답 시간이 초과되었습니다. 잠시 후 다시 확인해 주세요.',code:'UPSTREAM_TIMEOUT'};
 return {error:'인베스팅 데이터 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',code:'UPSTREAM_ERROR'};
}
