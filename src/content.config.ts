import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** PLAN.md §13 데이터 모델 */
const projectStatus = z.enum(['운영 중', '개발 완료', '개발 중', '프로토타입', '내부 도구']);
const projectVisibility = z.enum(['public', 'anonymized', 'private']);
const clientType = z.enum(['자체 제품', '고객 프로젝트', '내부 도구']);

/** 사례 필터 분류 (PLAN.md §6) */
export const PROJECT_CATEGORIES = [
  'AI 에이전트',
  '음성 AI',
  '웹·SaaS',
  '모바일·디바이스',
  '데이터 자동화',
  '커머스',
  '홈페이지',
] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** 한 줄 문제 정의 — 카드에 노출 (PLAN.md §6) */
    summary: z.string(),
    problem: z.string(),
    solution: z.string(),
    category: z.array(z.enum(PROJECT_CATEGORIES)).min(1),
    /** 형태: 웹/앱/SaaS/내부 도구 등 */
    deliverables: z.array(z.string()),
    features: z.array(z.string()),
    /** 기술 태그 — 카드에는 최대 4개만 노출 (PLAN.md §6) */
    stack: z.array(z.string()),
    status: projectStatus,
    /** private → 빌드에서 제외 (PLAN.md §8) */
    visibility: projectVisibility,
    clientType,
    role: z.array(z.string()),
    ownershipNote: z.string().optional(),
    /** CLAIMS_REGISTER 승인 ID만 (PLAN.md §10) */
    approvedClaims: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    screenshots: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
          /** false 면 게시하지 않는다 (PLAN.md §9 공개 전 검토) */
          approved: z.boolean(),
        }),
      )
      .default([]),
    isFeatured: z.boolean().default(false),
    featuredRank: z.number().int().positive().optional(),
    /** 사례 상세 §① 요약 ~ ⑨ 결과 중 서술형 항목 */
    users: z.string(),
    scope: z.array(z.string()),
    architecture: z.string(),
    outcome: z.string(),
    /** 관련 서비스 CTA 연결 (PLAN.md §6 ⑪) */
    relatedService: z.string().optional(),
  }),
});

export const collections = { projects };
