/**
 * 사이트 전역 상수 (PLAN.md §5.11, §15, §19)
 *
 * ⚠️ TODO 표시된 값은 성민님 확인 전 placeholder 다. 추정해서 채우지 않는다.
 *    (PLAN.md §17 "근거 없는 문구는 placeholder 또는 `보류` 표시")
 *    확정 전 배포 시 `npm run check:placeholders` 가 경고한다.
 */

export const SITE = {
  name: '디토이스트',
  nameEn: 'Dittoist',
  /** TODO(성민): 대표 도메인 apex vs www 결정 (PLAN.md §19) — 현재 apex 가정 */
  url: 'https://dittoist.com',
  /** 아이브로 문구 (PLAN.md §2.2) */
  motto: 'AI로 세상을 널리 이롭게.',
  description:
    '디토이스트는 AI 에이전트를 중심으로 웹, 모바일 앱, 윈도우 프로그램과 기존 업무 시스템을 연결해 고객에게 필요한 IT 솔루션을 구축합니다.',
} as const;

export const CONTACT = {
  /** TODO(성민): Cloudflare Email Routing 개설 후 확정 (PLAN.md §19) */
  email: 'contact@dittoist.com',
  /** TODO(성민): 공개할 대표 전화번호 확정. 미정이면 UI 에서 자동 숨김 */
  phone: '',
  /** TODO(성민): 기존 디토이스트 카카오 비즈 채널 URL (PLAN.md §5.10) */
  kakaoUrl: '',
  /**
   * TODO(성민): 응답 기대치 문구 — "실제로 지킬 수 있을 때만" 표기 (PLAN.md §5.10)
   * 예: '영업일 기준 2일 이내에 회신드립니다.' / 빈 값이면 표시하지 않는다.
   */
  responsePromise: '',
} as const;

/** 사업자 정보 (PLAN.md §5.11 Footer) */
export const BUSINESS = {
  companyName: '디토이스트',
  /** TODO(성민): 대표자명 */
  ceo: '',
  /** TODO(성민): 사업자등록번호 */
  registrationNumber: '',
  /**
   * TODO(성민): 주소 공개 범위 결정 (PLAN.md §19)
   * 자택 주소면 법적 필요성과 공개 부담을 검토. 빈 값이면 표시하지 않는다.
   */
  address: '',
} as const;

/** 내비게이션 (PLAN.md §4.3) */
export const NAV_LINKS = [
  { label: '서비스', href: '/#services' },
  { label: '진행 방식', href: '/#process' },
  { label: '구축 사례', href: '/work' },
  { label: '디토이스트 소개', href: '/#about' },
] as const;

/**
 * 분석 이벤트 이름 (PLAN.md §15)
 * 영업 퍼널 측정용. 여기 없는 이름을 임의로 추가하지 않는다.
 */
export const ANALYTICS_EVENTS = [
  'hero_contact_click',
  'hero_work_click',
  'service_card_click',
  'project_view',
  'contact_start',
  'contact_submit_success',
  'contact_submit_error',
  'email_click',
  'phone_click',
  'kakao_click',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];
