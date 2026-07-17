# Dittoist Homepage

디토이스트 공식 회사 소개 및 프로젝트 상담 홈페이지입니다. Astro 정적 페이지로 빌드해
`dist`만 배포하며, 상담 접수는 기존 D:Talk FastAPI 백엔드를 사용합니다.

## Commands

```sh
npm install
npm run dev
npm run check
npm run check:contrast
npm run build
```

개발 서버는 프로젝트 지침에 따라 Astro background mode로 실행됩니다.

```sh
npx astro dev status
npx astro dev logs
npx astro dev stop
```

## Routes

- `/` 회사 소개, 서비스, 프로세스, 대표 사례, 상담
- `/work` 전체 구축 사례 및 필터
- `/work/[slug]` 사례 상세
- `/contact` 상담
- `/privacy`, `/terms`, `/404`

## Contact API

홈페이지는 정적 빌드이며 상담 폼만 기존 D:Talk FastAPI 백엔드의
`https://api.dtalk.dittoist.com/api/website-contact`를 호출합니다. 홈페이지 서버에 별도 백엔드
프로세스가 필요하지 않습니다. API 주소를 바꿀 때만 빌드 전 `.env`에 아래 공개 변수를 설정합니다.

- `PUBLIC_CONTACT_API_URL`

Resend 키와 수신 주소는 홈페이지에 두지 않고 D:Talk 백엔드 환경 변수로 관리합니다.

미확정 사업자 정보, 전화번호, 카카오 채널 URL은 `src/lib/site.ts`에서 확정 후 입력합니다.
