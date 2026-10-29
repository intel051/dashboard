import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Macro Week · 미국 경제지표',description:'요일별 미국 경제지표와 시장 영향 해석'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
