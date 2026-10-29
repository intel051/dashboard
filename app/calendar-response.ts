import type {Event} from './model';
export class CalendarResponseError extends Error {
 code:string;
 constructor(message:string,code:string){super(message);this.name='CalendarResponseError';this.code=code}
}
export type CalendarPayload={events:Event[];updated:string;expires?:number;provider?:string;cached?:boolean};
export async function readCalendarResponse(response:Response):Promise<CalendarPayload>{
 if(response.status===401||response.status===403)throw new CalendarResponseError('사이트 로그인 또는 접근 권한을 확인할 수 없습니다. 사이트를 직접 열어 로그인 상태를 확인해 주세요.','SESSION_REQUIRED');
 const body=await response.text();
 if(/^\s*</.test(body))throw new CalendarResponseError('데이터 요청에 웹페이지가 반환되었습니다. 아래에서 해당 주의 페이지를 다시 열어 주세요.','HTML_RESPONSE');
 let value:any;try{value=JSON.parse(body)}catch{throw new CalendarResponseError('서버가 올바른 데이터 형식으로 응답하지 않았습니다. 잠시 후 다시 시도해 주세요.','INVALID_JSON')}
 if(!response.ok)throw new CalendarResponseError(typeof value?.error==='string'?value.error:'데이터 조회에 실패했습니다. (HTTP '+response.status+')',typeof value?.code==='string'?value.code:'HTTP_ERROR');
 if(!Array.isArray(value?.events)||!Number.isFinite(Date.parse(value.updated)))throw new CalendarResponseError('서버 응답에서 경제지표 데이터와 수집 시각을 확인할 수 없습니다.','INVALID_PAYLOAD');
 return value;
}
