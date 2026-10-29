import {analyzeDate,AnalysisError} from '../../server/gemini';
import {validDateKey} from '../../dates';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request:Request){
 try{
 const body=await request.json() as any;
 if(!body||!validDateKey(body.date)||!['rates','growth'].includes(body.regime)||![2,3].includes(body.minImportance)||body.eventId!==undefined&&(typeof body.eventId!=='string'||body.eventId.length>100))return Response.json({error:'분석 날짜·관점·중요도 입력을 확인해 주세요.',code:'INVALID_INPUT'},{status:400});
 if(Math.abs(Date.now()-Date.parse(body.date+'T12:00:00+09:00'))>90*86400000)return Response.json({error:'AI 분석은 최근 90일 범위에서 요청해 주세요.',code:'INVALID_RANGE'},{status:400});
 return Response.json(await analyzeDate(body.date,body.regime,body.minImportance,body.eventId),{headers:{'Cache-Control':'no-store'}});
 }catch(e){
 if(e instanceof SyntaxError)return Response.json({error:'요청 JSON 형식을 확인해 주세요.',code:'INVALID_JSON'},{status:400});
 if(e instanceof AnalysisError)return Response.json({error:e.message,code:e.code},{status:e.status,headers:{'Cache-Control':'no-store',...(e.retryAfter?{'Retry-After':e.retryAfter}:{})}});
 return Response.json({error:'분석용 경제지표를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',code:'SOURCE_ERROR'},{status:502});
 }
}
