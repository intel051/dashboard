import Dashboard from './dashboard';
import {calendarSelection} from './dates';
import {getTradingViewCalendar,tradingViewFailure} from './server/tradingview-calendar';
export const dynamic='force-dynamic';
export default async function Home({searchParams}:{searchParams:Promise<{week?:string|string[];day?:string|string[];view?:string|string[]}>}){
 const query=await searchParams;
 const {startKey,endKey,initialDay}=calendarSelection(query);
 const initialView=query.view==='market'?'market':'analysis';
 const asOf=Date.now();
 try{const data=await getTradingViewCalendar(startKey,endKey);return <Dashboard initialView={initialView} initialDay={initialDay} asOf={asOf} initialStart={startKey} initialEvents={data.events} initialUpdated={data.updated} initialExpires={data.expires}/>}
 catch(error){return <Dashboard initialView={initialView} initialDay={initialDay} asOf={asOf} initialStart={startKey} initialEvents={[]} initialError={tradingViewFailure(error).error} initialErrorCode={tradingViewFailure(error).code}/>}
}
