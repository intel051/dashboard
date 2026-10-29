import {rangeValid} from '../../investing';
import {getInvestingCalendar,investingFailure} from '../../server/investing';
export async function GET(request:Request){
 const u=new URL(request.url),start=u.searchParams.get('start'),end=u.searchParams.get('end');
 if(!rangeValid(start,end))return Response.json({error:'최대 7일의 올바른 날짜 범위를 지정해 주세요.',code:'INVALID_RANGE'},{status:400});
 try{return Response.json(await getInvestingCalendar(start!,end!),{headers:{'Cache-Control':'no-store'}})}
 catch(error){return Response.json(investingFailure(error),{status:502,headers:{'Cache-Control':'no-store'}})}
}
