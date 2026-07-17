/**
 * 상담 폼 검증 (PLAN.md §14)
 *
 * 홈페이지 클라이언트 검증 규칙. D:Talk 백엔드의 공개 상담 API도 같은 제한을 독립적으로
 * 다시 검증한다 — 클라이언트 검증은 UX 용일 뿐 보안 경계가 아니다.
 */

/** 폼이 렌더된 뒤 이 시간이 지나야 제출을 받는다 (봇 차단, PLAN.md §14) */
export const MIN_FILL_MS = 3000;

/** 스팸 봇이 채우도록 유도하는 숨김 필드 이름 */
export const HONEYPOT_FIELD = 'company_website';

export const RESULT_OPTIONS = [
  'AI 에이전트',
  '웹 서비스',
  '모바일 앱',
  '윈도우 프로그램',
  '업무 자동화',
  '아직 모르겠음',
] as const;

export interface ContactInput {
  /** 필수: 담당자명 */
  name: string;
  /** 필수: 이메일 또는 연락처 중 하나 이상 */
  email: string;
  phone: string;
  /** 필수: 해결하려는 문제 */
  problem: string;
  /** 필수: 개인정보 수집 동의 */
  consent: boolean;
  /** 선택 */
  company: string;
  desiredResult: string;
  timeline: string;
  budget: string;
  existingSystem: string;
}

export type ContactErrors = Partial<Record<keyof ContactInput | 'form', string>>;

export const EMPTY_CONTACT: ContactInput = {
  name: '',
  email: '',
  phone: '',
  problem: '',
  consent: false,
  company: '',
  desiredResult: '',
  timeline: '',
  budget: '',
  existingSystem: '',
};

/**
 * 이메일 형식 검사.
 * RFC 전체를 구현하지 않는다 — 명백한 오타를 잡고 실제 발송은 메일 서버가 판단한다.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 국내 전화번호: 숫자 9~11자리 (하이픈·공백·+82 허용) */
function isValidPhone(value: string): boolean {
  const digits = value.replace(/[\s()-]/g, '').replace(/^\+82/, '0');
  return /^\d{9,11}$/.test(digits);
}

export const LIMITS = {
  name: 50,
  email: 254,
  phone: 30,
  problem: 3000,
  company: 100,
  desiredResult: 40,
  timeline: 100,
  budget: 100,
  existingSystem: 500,
} as const;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  const name = input.name.trim();
  if (!name) {
    errors.name = '이름(담당자명)을 입력해 주세요.';
  } else if (name.length > LIMITS.name) {
    errors.name = `이름은 ${LIMITS.name}자 이내로 입력해 주세요.`;
  }

  const email = input.email.trim();
  const phone = input.phone.trim();
  if (!email && !phone) {
    // 필수 최소화 (PLAN.md §5.10): 이메일 '또는' 연락처
    errors.email = '이메일 또는 연락처 중 하나는 입력해 주세요.';
  } else {
    if (email && !EMAIL_PATTERN.test(email)) {
      errors.email = '이메일 형식을 확인해 주세요.';
    } else if (email.length > LIMITS.email) {
      errors.email = '이메일이 너무 깁니다.';
    }
    if (phone && !isValidPhone(phone)) {
      errors.phone = '연락처 형식을 확인해 주세요. (예: 010-1234-5678)';
    }
  }

  const problem = input.problem.trim();
  if (!problem) {
    errors.problem = '해결하려는 문제를 알려주세요.';
  } else if (problem.length < 10) {
    errors.problem = '조금만 더 자세히 적어주시면 정확히 검토할 수 있습니다. (10자 이상)';
  } else if (problem.length > LIMITS.problem) {
    errors.problem = `${LIMITS.problem}자 이내로 입력해 주세요.`;
  }

  if (!input.consent) {
    errors.consent = '개인정보 수집·이용에 동의해 주세요.';
  }

  if (input.company.trim().length > LIMITS.company) {
    errors.company = `회사·기관명은 ${LIMITS.company}자 이내로 입력해 주세요.`;
  }
  if (input.existingSystem.trim().length > LIMITS.existingSystem) {
    errors.existingSystem = `${LIMITS.existingSystem}자 이내로 입력해 주세요.`;
  }

  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** 필드 순서 — 오류 발생 시 첫 번째 오류 필드로 포커스를 옮기는 데 사용 (PLAN.md §14) */
export const FIELD_ORDER: Array<keyof ContactInput> = [
  'name',
  'email',
  'phone',
  'company',
  'desiredResult',
  'problem',
  'timeline',
  'budget',
  'existingSystem',
  'consent',
];
