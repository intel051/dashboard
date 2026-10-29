export function dateKey(d:Date){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const p=(type:string)=>parts.find(x=>x.type===type)!.value;return p('year')+'-'+p('month')+'-'+p('day')}
export function mondayOf(date:Date){const local=new Date(dateKey(date)+'T00:00:00+09:00');const day=new Date(+local+9*3600000).getUTCDay();return new Date(+local-((day+6)%7)*86400000)}
export function validDateKey(value:unknown):value is string{return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00+09:00'))&&dateKey(new Date(value+'T00:00:00+09:00'))===value}
export function calendarSelection(query:{week?:string|string[];day?:string|string[]},now=new Date()){
 const week=Array.isArray(query.week)?query.week[0]:query.week;
 const day=Array.isArray(query.day)?query.day[0]:query.day;
 const today=dateKey(now);
 const anchor=validDateKey(week)?week:validDateKey(day)?day:today;
 const start=mondayOf(new Date(anchor+'T00:00:00+09:00'));
 const startKey=dateKey(start),endKey=dateKey(new Date(+start+6*86400000));
 const selected=validDateKey(day)&&day>=startKey&&day<=endKey?day:!validDateKey(week)&&!validDateKey(day)?today:null;
 const initialDay=selected?Math.round((+new Date(selected+'T00:00:00+09:00')-+start)/86400000):-1;
 return {startKey,endKey,initialDay};
}
