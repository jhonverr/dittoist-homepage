/**
 * 페이지 메타데이터·구조화 데이터 (PLAN.md §15)
 */
import { SITE, CONTACT, BUSINESS } from './site';

export interface PageMeta {
  title: string;
  description: string;
  /** OG 이미지 경로 (사이트 루트 기준) */
  image?: string;
  /** 검색 노출 제외 (404 등) */
  noindex?: boolean;
}

/** 페이지 제목에 회사명을 붙인다. 홈은 중복을 피해 그대로 둔다. */
export function formatTitle(title: string, isHome = false): string {
  return isHome ? title : `${title} | ${SITE.name}`;
}

export function canonical(pathname: string): string {
  // 경로 끝 슬래시를 정규화해 canonical 이 중복되지 않게 한다.
  const clean = pathname.replace(/\/+$/, '') || '/';
  return new URL(clean, SITE.url).href;
}

/** Organization 구조화 데이터 (PLAN.md §15) */
export function organizationJsonLd() {
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    alternateName: SITE.nameEn,
    url: SITE.url,
    description: SITE.description,
    slogan: SITE.motto,
  };

  // 미확정 값은 넣지 않는다 (PLAN.md §17)
  if (CONTACT.email) {
    org.contactPoint = [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: CONTACT.email,
        ...(CONTACT.phone ? { telephone: CONTACT.phone } : {}),
        availableLanguage: ['Korean'],
      },
    ];
  }
  if (BUSINESS.ceo) org.founder = { '@type': 'Person', name: BUSINESS.ceo };
  if (BUSINESS.address) org.address = { '@type': 'PostalAddress', streetAddress: BUSINESS.address };

  return org;
}

/** Service 구조화 데이터 (PLAN.md §15) */
export function serviceJsonLd(services: Array<{ title: string; outcome: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE.name} 서비스`,
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.title,
        description: s.outcome,
        provider: { '@type': 'Organization', name: SITE.name },
        areaServed: 'KR',
      },
    })),
  };
}

/** Breadcrumb 구조화 데이터 (PLAN.md §15) */
export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: canonical(item.path),
    })),
  };
}
