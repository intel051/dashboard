export type Event={id:string;date:string;name:string;importance:number;actual:string;forecast:string;previous:string;revised?:string;eventType?:string;source:string;sourceURL?:string;};
export const kinds=[['inflation','CPI · PCE · 생산자물가'],['growth','소매판매 · GDP · PMI'],['jobs','비농업고용 · 구인'],['unemployment','실업률 · 실업수당'],['rates','기준금리'],['unknown','기타 / 직접 분류']] as const;
export function classify(name:string){if(/cpi|inflation|ppi|pce|price|물가/i.test(name))return 'inflation';if(/unemployment|jobless|claims|실업/i.test(name))return 'unemployment';if(/payroll|employment|jolts|job opening|고용/i.test(name))return 'jobs';if(/interest rate|fed funds|금리결정/i.test(name))return 'rates';if(/gdp|retail|pmi|ism|industrial|confidence|sentiment|소매|생산/i.test(name))return 'growth';return 'unknown'}
export function numeric(v:string){const s=String(v).trim().replace(/,/g,'');if(!/^[+-]?(?:\d+\.?\d*|\.\d+)\s*[KMBT%]?$/.test(s.toUpperCase()))return null;const n=parseFloat(s);const x=s.slice(-1).toUpperCase();return n*({K:1e3,M:1e6,B:1e9,T:1e12}[x]||1)}
export function analyze(e:Event,override?:string,regime='rates'){
 const a=numeric(e.actual),f=numeric(e.forecast),kind=override||classify(e.name);
 const unit=(v:string)=>v.trim().slice(-1).match(/[a-z%]/i)?.[0].toUpperCase()||'';
 if(e.actual&&e.forecast&&unit(e.actual)!==unit(e.forecast))return {title:'단위 확인 필요',text:'실제값과 예상치의 단위를 맞춰 주세요. 서로 다른 단위는 비교하지 않습니다.',effects:[0,0,0,0],pending:true};
 if(e.eventType==='speech'||e.eventType==='report')return {title:'정성 해석 필요',text:'연설·보고서 일정입니다. 숫자 비교만으로 방향을 판단할 수 없습니다. 발언·문서 내용과 금리 반응을 함께 확인하세요.',effects:[0,0,0,0],pending:true};
 if(!e.actual&&Date.parse(e.date)<Date.now())return {title:'발표값 확인 필요',text:'예정 시각이 지났지만 실제값이 아직 제공되지 않았습니다. 발표 지연·수집 지연 여부를 확인하세요.',effects:[0,0,0,0],pending:true};
 if(!e.actual)return {title:'발표 대기',text:'발표 전입니다. 예상치와 실제값이 모두 확보되면 해석합니다.',effects:[0,0,0,0],pending:true};
 if(a===null||f===null)return {title:'비교 자료 부족',text:'실제값과 시장 예상치가 같은 단위의 숫자인지 확인해 주세요. 이전치만으로 서프라이즈를 판단하지 않습니다.',effects:[0,0,0,0],pending:true};
 if(kind==='unknown')return {title:'개별 해석 필요',text:'정형 해석을 지원하지 않는 지표입니다. 아래에서 지표 유형을 지정해 주세요.',effects:[0,0,0,0],pending:true};
 const s=Math.sign(a-f);if(!s)return {title:'예상 부합',text:'시장 예상에 부합합니다. 세부항목·이전치 수정·동시 발표가 시장 반응을 좌우할 수 있습니다.',effects:[0,0,0,0],pending:false};
 const hot=s*(kind==='unemployment'?-1:1);const strong=hot>0;const growth=kind==='growth'||kind==='jobs'||kind==='unemployment';const stock=growth&&regime==='growth'?hot:-hot;
 return {title:kind==='inflation'?(strong?'예상보다 높은 물가':'예상보다 낮은 물가'):kind==='rates'?(strong?'예상보다 높은 금리':'예상보다 낮은 금리'):(strong?'예상보다 강한 경기·고용':'예상보다 약한 경기·고용'),text:kind==='inflation'?(strong?'인플레이션 압력이 예상보다 큽니다. 금리 인하 기대 약화와 실질금리 상승은 달러를 지지하고 성장주·금에 부담이 될 수 있습니다.':'물가 둔화는 금리 인하 기대를 높일 수 있습니다. 달러·실질금리 하락은 성장주와 금에 우호적일 수 있습니다.'):kind==='rates'?'시장 예상과의 금리 차이를 반영한 기본 시나리오입니다. 성명서·점도표·기자회견에 따라 반응이 바뀔 수 있습니다.':(strong?'견조한 수요·고용 신호입니다. 금리 인하 기대는 약해질 수 있지만 기업 이익 전망에는 긍정적입니다.':'경기·고용 둔화 신호입니다. 금리 인하 기대에는 긍정적이지만 침체 우려가 커지면 주식에는 부담이 됩니다.')+(regime==='growth'?' 현재 해석은 성장 우려를 우선합니다.':' 현재 해석은 금리 경로를 우선합니다.'),effects:[hot,stock,stock,-hot],pending:false};
}
