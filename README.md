# Macro Week

미국 중요도 ★★ 이상 경제지표와 Gemini 기반 매크로 해석 대시보드. Next.js App Router / Vercel.

## 시작

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local`의 `GEMINI_API_KEY`에 본인의 Gemini API 키를 설정합니다. 실제 키를 GitHub에 올리지 마세요.

## Vercel 배포

1. 이 프로젝트를 GitHub 저장소 `intel051/dashboard`에 올립니다.
2. Vercel의 Add New Project에서 해당 저장소를 Import합니다. Framework는 Next.js입니다.
3. 환경변수 `GEMINI_API_KEY`를 Production과 Preview에 추가합니다.
4. 선택적으로 `GEMINI_MODEL`을 지정합니다. 기본값은 `gemini-3.5-flash-lite`이며, 본인의 AI Studio에서 해당 모델과 무료 할당량 사용 가능 여부를 확인하세요.
5. Deploy합니다. 환경변수 변경 후에는 Redeploy가 필요합니다.

## 사용

- 기본 주소는 한국시간 오늘 날짜를 선택합니다. `?day=YYYY-MM-DD`로 날짜를 지정할 수 있습니다.
- AI 분석하기를 누르면 서버가 인베스팅에서 해당 날짜의 실제 발표값을 다시 수집해 Gemini에 전달합니다.
- 기본 일간 분석과 지표별 Gemini 분석을 제공합니다. 규칙 기반 결과는 별도의 참고 항목입니다.
- 동일한 발표 데이터·모델·관점의 응답은 Next.js Data Cache로 24시간 재사용합니다. 발표값이나 수정치가 바뀌면 캐시 키가 달라집니다.
- API 호출은 사용자의 명시적 버튼 동작으로만 실행하며, 자동 재시도나 다른 유료 모델로의 전환을 하지 않습니다.
- 429 오류는 무료 한도/요청 속도 제한입니다. 프롬프트 오류와 구분해 표시합니다.

## 범위

AI 입력에는 경제지표 수치만 포함됩니다. 차트 iframe의 실제 가격·국채금리·뉴스를 읽지 않으며, 모델에도 이를 관측한 것처럼 작성하지 않도록 지시합니다. AI 방향성은 검증된 적중률이 아닌 조건부 해석입니다. 인베스팅의 비공개 웹 데이터 연결은 제공사 변경/제한에 따라 중단될 수 있습니다.

## 인베스팅 연결 실패 진단

서버가 `endpoints.investing.com`의 경제 캘린더 occurrences JSON을 직접 요청하고, event_id로 발표 메타데이터를 결합합니다. 미국(country_id 5), 중요도 medium/high, 한국시간 날짜 범위만 표시합니다. 공식 인증 API가 아니므로 웹 브라우저 접근과 서버 수집 허용 여부는 다릅니다.

- 403/1010 또는 browser_signature_banned: 제공사가 서버 요청을 거부한 상태입니다. 동일 서버 인스턴스에서는 15분간 재요청하지 않습니다.
- 429: 제공사 요청 한도이며 Retry-After를 반영합니다.
- HTML 응답: 데이터 대신 페이지가 반환된 경우로 구분합니다.
- 초기 서버 수집이나 화면 갱신 실패 뒤에는 자동 재시도를 멈춥니다. 원문 확인·직접 입력·권한 있는 Trading Economics 연결을 사용할 수 있습니다.
- Gemini는 서버에서 인베스팅을 다시 수집합니다. 직접 입력이나 TradingView 위젯 값을 Gemini에 전달하는 기능은 현재 없습니다.

이 오류 처리는 차단을 해제하거나 데이터 수집 성공을 보장하지 않습니다.

## 주요 파일

- `app/server/gemini.ts`: Gemini 호출, 프롬프트, JSON 스키마, 근거 ID 검증, 결과 캐시
- `app/api/analysis/route.ts`: 일간·개별 AI 분석 API
- `app/ai-analysis.tsx`: AI 분석 화면
- `app/assets.ts`: 차트 상품·봉 주기
- `app/server/investing.ts`: 경제지표 수집

```bash
npm run typecheck
npm run build
```
