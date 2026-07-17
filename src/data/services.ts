/**
 * 서비스 6개 분류 (PLAN.md §5.3)
 * 사례 필터·2차 서비스 페이지와 1:1 대응하도록 id 를 유지한다.
 * 콘텐츠 문구는 CONTENT_GUIDE.md 의 "기술보다 결과 먼저" 원칙을 따른다.
 */

export interface Service {
  id: string;
  title: string;
  /** 이 서비스가 만들어내는 결과 한 줄 */
  outcome: string;
  items: string[];
}

export const SERVICES: Service[] = [
  {
    id: 'ai-agent',
    title: 'AI 에이전트·RAG 솔루션',
    outcome: '흩어진 사내 문서와 업무 규칙을 이해하고, 필요한 일을 직접 처리하는 AI를 만듭니다.',
    items: [
      '사내 문서 질의응답',
      '지식 베이스 구축',
      '업무별 에이전트',
      '멀티 에이전트 워크플로',
      '폐쇄망·온프레미스 LLM',
      '관리자용 프롬프트·모델 설정',
    ],
  },
  {
    id: 'voice-ai',
    title: 'AI 음성·상담 자동화',
    outcome: '전화와 상담에서 반복되는 응대를 AI가 받고, 예약·안내까지 연결합니다.',
    items: [
      'AI 전화 응대',
      'STT/TTS 음성 처리',
      '예약·FAQ 자동화',
      '통화 이력·상담 분석',
      '문자·알림톡·캘린더 연동',
    ],
  },
  {
    id: 'web-saas',
    title: '웹 서비스·SaaS',
    outcome: '고객이 쓰는 화면과 내부에서 운영하는 화면을 함께 만듭니다.',
    items: [
      '고객용 웹 서비스',
      '관리자 콘솔',
      '회원·권한·결제',
      '예약·주문·정산',
      '대시보드',
      '반응형 홈페이지',
    ],
  },
  {
    id: 'mobile-device',
    title: '모바일 앱·스마트 디바이스',
    outcome: '현장과 이동 중에도 쓰이는 앱과 장치 연동을 구축합니다.',
    items: [
      'Android·모바일 앱',
      '카메라·음성·센서 활용',
      '스마트글래스·현장 장치 연동',
      '실시간 통신',
    ],
  },
  {
    id: 'windows-program',
    title: '윈도우·업무용 프로그램',
    outcome: '엑셀과 수작업으로 버티던 일을 전용 프로그램으로 바꿉니다.',
    items: ['반복 작업 자동화', '문서·파일 처리', '사내 전용 데스크톱 프로그램', '기존 프로그램 연계'],
  },
  {
    id: 'system-integration',
    title: '시스템 연동·배포',
    outcome: '이미 쓰고 있는 시스템과 새로 만든 서비스를 연결하고, 운영까지 올립니다.',
    items: [
      '외부 API 연동',
      'Oracle·PostgreSQL 등 DB 연동',
      '클라우드·Docker 배포',
      '모니터링·로그',
      '인증·권한·보안',
    ],
  },
];

/** PLAN.md §5.3 공통 마무리 문구 */
export const SERVICES_CLOSING =
  '목록에 없는 형태라도 현재 업무와 목표에 맞춰 필요한 구조를 함께 설계합니다.';
