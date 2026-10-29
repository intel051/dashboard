export const assets=[
 ['달러인덱스','DXY','CAPITALCOM:DXY'],
 ['나스닥','USTEC.F','BLACKBULL:USTEC.F'],
 ['S&P 500','US500.F','BLACKBULL:US500.F'],
 ['골드','GOLD.F','BLACKBULL:GOLD.F'],
] as const;
export const marketAssets=[...assets,
 ['미국 10년물 금리','US10Y','TVC:US10Y'],
 ['미국 2년물 금리','US02Y','TVC:US02Y'],
] as const;
export const chartIntervals=[['1','1분'],['5','5분'],['15','15분'],['30','30분'],['60','1시간'],['120','2시간'],['240','4시간'],['D','일봉']] as const;
export function tradingViewURL(symbol:string,interval?:string){return 'https://www.tradingview.com/chart/?symbol='+encodeURIComponent(symbol)+(interval?'&interval='+encodeURIComponent(interval):'')}
export function advancedChartConfig(symbol:string,interval:string){return {
 symbol,interval,timezone:'Asia/Seoul',theme:'light',style:'1',locale:'kr',autosize:true,
 allow_symbol_change:false,hide_top_toolbar:false,hide_side_toolbar:true,hide_legend:false,hide_volume:true,
 calendar:false,details:false,hotlist:false,save_image:false,withdateranges:true,
 backgroundColor:'#ffffff',gridColor:'rgba(45,48,54,0.04)',
 overrides:{'mainSeriesProperties.candleStyle.upColor':'#8aaedc','mainSeriesProperties.candleStyle.downColor':'#d88f96','mainSeriesProperties.candleStyle.borderUpColor':'#8aaedc','mainSeriesProperties.candleStyle.borderDownColor':'#d88f96','mainSeriesProperties.candleStyle.wickUpColor':'#8aaedc','mainSeriesProperties.candleStyle.wickDownColor':'#d88f96'},
 };
}
