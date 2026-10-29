export async function POST(request:Request){
 try{
 const body=await request.json() as {key:string;start:string;end:string};
 if(typeof body.key!== 'string'||body.key.length<3||body.key.length>500)return Response.json({error:'Trading Economics API 키를 입력해 주세요.'},{status:400});
 if(!/^\d{4}-\d{2}-\d{2}$/.test(body.start)||!/^\d{4}-\d{2}-\d{2}$/.test(body.end))return Response.json({error:'날짜 형식을 확인해 주세요.'},{status:400});
 const a=new Date(body.start),b=new Date(body.end);if(!Number.isFinite(+a)||!Number.isFinite(+b)||+b-+a>8*86400000||b<a)return Response.json({error:'최대 8일 범위만 조회할 수 있습니다.'},{status:400});
 const u=new URL('https://api.tradingeconomics.com/calendar/country/united%20states/'+body.start+'/'+body.end);u.searchParams.set('c',body.key);u.searchParams.set('f','json');
 const r=await fetch(u,{signal:AbortSignal.timeout(15000)});if(!r.ok)return Response.json({error:'데이터 조회 실패. API 키와 미국 캘린더 이용 권한을 확인해 주세요.'},{status:502});
 const data=await r.json();if(!Array.isArray(data))throw Error();
 return Response.json({events:data.filter((e:any)=>e.Country==='United States'&&Number(e.Importance)>=2).map((e:any)=>({id:String(e.CalendarId),date:e.Date.endsWith('Z')?e.Date:e.Date+'Z',name:e.Event,importance:Number(e.Importance),actual:e.Actual||'',forecast:e.Forecast||'',previous:e.Previous||'',revised:e.Revised||'',source:e.Source||'Trading Economics',sourceURL:/^https?:\/\//.test(e.SourceURL)?e.SourceURL:'https://tradingeconomics.com/united-states/calendar'})),updated:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'데이터 제공사에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'},{status:502})}
}
