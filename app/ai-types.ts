export const aiTickers=['DXY','USTEC.F','US500.F','GOLD.F'] as const;
export type AiTicker=typeof aiTickers[number];
export type AiAsset={ticker:AiTicker;direction:'bullish'|'bearish'|'neutral'|'uncertain';confidence:'low'|'moderate';reasoning:string;upsideFactors:string[];downsideFactors:string[];invalidation:string;evidenceIds:string[]};
export type AiAnalysis={summary:string;dominantTheme:string;assets:AiAsset[];limitations:string[]};
export type AiResponse={analysis:AiAnalysis;generatedAt:string;sourceUpdatedAt:string;model:string;date:string;eventCount:number;scope:'daily'|'indicator'};
export const directionLabel={bullish:'상방 우세',bearish:'하방 우세',neutral:'중립',uncertain:'판단 유보'} as const;
