'use client';
import {useState} from 'react';
import {Info} from 'lucide-react';
import {marketAssets,chartIntervals,advancedChartConfig,tradingViewURL} from './assets';
import Widget from './tradingview-widget';
function MarketChart({name,ticker,symbol,initialInterval}:{name:string;ticker:string;symbol:string;initialInterval:string}){
 const [interval,setInterval]=useState(initialInterval);const [feed,setFeed]=useState(symbol);
 return <article className="panel market-chart"><div className="chart-heading"><div><h3>{name}</h3><small>{ticker==='DXY'?'달러인덱스 CFD · '+feed.split(':')[0]:ticker==='US10Y'||ticker==='US02Y'?'미국 국채 수익률 (%)':feed}</small></div><div className="chart-card-tools"><select aria-label={name+' 봉 주기'} value={interval} onChange={e=>setInterval(e.target.value)}>{chartIntervals.map(([v,label])=><option key={v} value={v}>{label}</option>)}</select><a href={tradingViewURL(feed,interval)} target="_blank" rel="noreferrer" aria-label={name+' 트레이딩뷰에서 열기'}>전체 화면 ↗</a></div></div>{ticker==='DXY'&&<label className="dxy-feed">DXY 제공사<select aria-label="DXY 데이터 제공사" value={feed} onChange={e=>setFeed(e.target.value)}><option value="CAPITALCOM:DXY">Capital.com · DXY</option><option value="PEPPERSTONE:USDX">Pepperstone · USDX</option></select></label>}<Widget type="advanced-chart" config={advancedChartConfig(feed,interval)}/></article>
}
export default function MarketCharts(){
 const [interval,setInterval]=useState('15');
 return <section id="charts"><div className="section-title"><div><span className="eyebrow">MARKETS & RATES</span><h2>시장의 실제 움직임</h2></div><span>차트 시간대 KST · 기본 15분봉</span></div><div className="chart-interval-toolbar"><span>전체 차트 주기</span><div>{chartIntervals.map(([value,label])=><button aria-pressed={interval===value} className={interval===value?'selected':''} key={value} onClick={()=>setInterval(value)}>{label}</button>)}</div></div><div className="chart-grid">{marketAssets.map(([name,ticker,symbol])=><MarketChart key={symbol+':'+interval} name={name} ticker={ticker} symbol={symbol} initialInterval={interval}/>)}</div><div className="notice"><Info size={17}/><span>각 차트에서도 봉 주기를 개별 선택할 수 있습니다. DXY는 제공사 CFD 시세이며, 국채 차트는 채권 가격이 아닌 수익률(%)입니다. 지연 여부와 제공 주기는 차트 표시를 확인하세요.</span></div></section>
}
