/**
 * 분석 이벤트 전송 (PLAN.md §15)
 *
 * Cloudflare Web Analytics 는 쿠키리스이고 자동 페이지뷰만 수집하므로,
 * 영업 퍼널 이벤트는 커스텀으로 보낸다. 수집기가 아직 붙지 않은 환경에서도
 * 사이트가 깨지지 않도록 모든 경로를 안전하게 처리한다.
 *
 * 개인정보는 절대 payload 에 담지 않는다 (PLAN.md §16).
 */
import type { AnalyticsEvent } from './site';

type EventPayload = Record<string, string | number | boolean>;

declare global {
  interface Window {
    /** Cloudflare Web Analytics (zaraz) — 존재할 때만 사용 */
    zaraz?: { track: (name: string, data?: EventPayload) => void };
    /** 디버깅용 이벤트 버퍼 (개발 환경에서만 채워진다) */
    __dittoistEvents?: Array<{ name: string; data?: EventPayload }>;
  }
}

export function trackEvent(name: AnalyticsEvent, data?: EventPayload): void {
  if (typeof window === 'undefined') return;

  try {
    window.zaraz?.track(name, data);
  } catch {
    // 분석 실패가 사용자 동작(폼 제출 등)을 막아서는 안 된다.
  }

  if (import.meta.env.DEV) {
    (window.__dittoistEvents ??= []).push({ name, data });
    console.debug('[analytics]', name, data ?? '');
  }
}

/**
 * UTM 파라미터 보존 (PLAN.md §15)
 * 명함·위시켓·제안서·카카오 채널 유입을 폼 제출까지 연결하기 위해
 * 첫 진입의 UTM 을 sessionStorage 에 저장한다.
 */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const UTM_STORAGE_KEY = 'dittoist:utm';

export function captureUtm(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) found[key] = value.slice(0, 120);
    }
    if (Object.keys(found).length > 0) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
    }
  } catch {
    // sessionStorage 차단 환경 — UTM 보존만 포기한다.
  }
}

export function getUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}
