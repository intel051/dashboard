import Dashboard from './dashboard';
import {calendarSelection} from './dates';
import {getInvestingCalendar,investingFailure} from './server/investing';
export const dynamic='force-dynamic';
export default async function Home({searchParams}:{searchParams:Promise<{week?:string|string[];day?:string|string[];view?:string|string[]}>}){
 const query=await searchParams;
 const {startKey,endKey,initialDay}=calendarSelection(query);
 const initialView=query.view==='market'?'market':'analysis';
 const asOf=Date.now();
 try{const data=await getInvestingCalendar(startKey,endKey);return <Dashboard initialView={initialView} initialDay={initialDay} asOf={asOf} initialStart={startKey} initialEvents={data.events} initialUpdated={data.updated} initialExpires={data.expires}/>}
 catch(error){return <Dashboard initialView={initialView} initialDay={initialDay} asOf={asOf} initialStart={startKey} initialEvents={[]} initialError={investingFailure(error).error} initialErrorCode={investingFailure(error).code}/>}
}
