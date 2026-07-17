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

## Publish

수정 사항을 GitHub `main`에 커밋·푸시하고 운영 서버에 배포하려면 커밋 메시지와 함께 실행합니다.

```sh
npm run publish -- "메인 페이지 문구 수정"
```

게시 명령은 Astro 검사, 명암비 검사, 프로덕션 빌드를 먼저 수행합니다. 검사를 통과하면 변경
사항을 커밋하고 GitHub에 푸시한 뒤 `ssh dtalk` 서버의 새 릴리스 디렉터리로 `dist`를 전송하고
`/var/www/dittoist-homepage/current` 링크를 교체합니다. 공개 URL 확인에 실패하면 이전 릴리스로
자동 복구합니다. `.env`와 키 파일은 게시할 수 없습니다.

로컬 SSH 별칭이나 확인 URL이 다른 환경에서는 아래 환경 변수로 덮어쓸 수 있습니다.

- `DITTOIST_DEPLOY_HOST`
- `DITTOIST_SITE_URL`

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
