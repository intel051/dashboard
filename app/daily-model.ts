import {analyze,classify,type Event} from './model';
import {dateKey} from './dates';
function family(name:string){
 if(/cpi|consumer price/i.test(name))return 'cpi';
 if(/ppi|producer price/i.test(name))return 'ppi';
 if(/pce|personal consumption/i.test(name))return 'pce';
 if(/jobless|claims/i.test(name))return 'claims';
 if(/payroll|unemployment rate|hourly earnings|participation/i.test(name))return 'employment-report';
 if(/retail/i.test(name))return 'retail';
 if(/gdp/i.test(name))return 'gdp';
 return classify(name)+':'+name.toLowerCase().replace(/\s*·.*$/,'').replace(/\([^)]*\)/g,'').trim();
}
export type ReleaseGroup={key:string;date:string;names:string[];weight:number;effects:number[];count:number};
export function dailyOutlook(events:Event[],day:string,regime='rates',asOf=Date.now()){
 const scoped=[...new Map(events.filter(e=>Number.isFinite(Date.parse(e.date))&&dateKey(new Date(e.date))===day&&e.importance>=2).map(e=>[e.id,e])).values()];
 const published=scoped.filter(e=>e.actual.trim()!==''&&Date.parse(e.date)<=asOf);
 const evaluated=published.map(e=>({event:e,result:analyze(e,undefined,regime)})).filter(x=>!x.result.pending);
 const map=new Map<string,{items:typeof evaluated;date:string}>();
 for(const item of evaluated){const e=item.event;const key=new Date(e.date).toISOString().slice(0,16)+':'+family(e.name);const group=map.get(key)||{items:[],date:e.date};group.items.push(item);map.set(key,group)}
 const groups:ReleaseGroup[]=[...map.entries()].map(([key,{items,date}])=>{
 const weights=items.map(x=>x.event.importance===3?2:1),sum=weights.reduce((a,b)=>a+b,0);
 return {key,date,names:items.map(x=>x.event.name),weight:Math.max(...weights),effects:[0,1,2,3].map(i=>items.reduce((a,x,j)=>a+x.result.effects[i]*weights[j],0)/sum),count:items.length};
 });
 const totalWeight=groups.reduce((s,g)=>s+g.weight,0);
 const assets=[0,1,2,3].map(i=>{
 const score=totalWeight?groups.reduce((s,g)=>s+g.effects[i]*g.weight,0)/totalWeight:0;
 const positive=groups.filter(g=>g.effects[i]>0.00001).length,negative=groups.filter(g=>g.effects[i]<-0.00001).length;
 const withinConflict=groups.some(g=>{const items=map.get(g.key)!.items;return items.some(x=>x.result.effects[i]>0)&&items.some(x=>x.result.effects[i]<0)});
 const mixed=positive>0&&negative>0||withinConflict;
 const direction=Math.abs(score)>=.2?Math.sign(score):0;
 const title=!groups.length?'판단 보류':direction>0?'상방 우세':direction<0?'하방 우세':mixed?'혼조 · 관망':'중립';
 const evidence=!groups.length?'비교 가능한 발표 없음':groups.length===1?'단일 발표 묶음':mixed?'상반된 근거 존재':direction===0?'예상 부합 중심':'근거 방향 일치';
 return {direction,title,evidence,positive,negative,neutral:groups.length-positive-negative,score,mixed};
 });
 const missing=published.length-evaluated.length;
 return {total:scoped.length,published:published.length,eligible:evaluated.length,excluded:missing,unreleased:scoped.length-published.length,groups,assets};
}
