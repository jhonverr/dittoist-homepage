/**
 * 디자인 토큰 색상 대비 검사 (PLAN.md §11.1, §16 접근성)
 *
 * tokens.css 를 직접 읽어 WCAG 대비를 계산한다. 토큰 값이 바뀌면 이 검사가 깨진다.
 * 실행: npm run check:contrast
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TOKENS_PATH = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url));

/** tokens.css 에서 --color-* 선언을 파싱한다. */
function readColorTokens() {
  const css = readFileSync(TOKENS_PATH, 'utf8');
  /** @type {Record<string, string>} */
  const tokens = {};
  for (const [, name, value] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[name] = value;
  }
  return tokens;
}

const luminance = (hex) => {
  const channels = hex
    .replace('#', '')
    .match(/../g)
    .map((pair) => {
      const c = parseInt(pair, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * 사이트에서 실제로 쓰는 조합만 검사한다.
 * min: 4.5 = 소형 텍스트 AA, 3 = 대형 텍스트/UI 경계 AA
 */
const RULES = [
  { fg: 'ink', bg: 'ivory', min: 4.5, use: '라이트 섹션 본문' },
  { fg: 'ink', bg: 'surface', min: 4.5, use: '카드 본문' },
  { fg: 'muted', bg: 'ivory', min: 4.5, use: '라이트 섹션 보조 텍스트' },
  { fg: 'muted', bg: 'surface', min: 4.5, use: '카드 보조 텍스트' },
  { fg: 'accent-deep', bg: 'ivory', min: 4.5, use: '라이트 섹션 강조 텍스트' },
  { fg: 'accent-deep', bg: 'surface', min: 4.5, use: '카드 강조 텍스트' },
  { fg: 'mint-deep', bg: 'ivory', min: 4.5, use: '라이트 섹션 상태 텍스트' },
  { fg: 'blue-deep', bg: 'ivory', min: 4.5, use: '라이트 섹션 링크' },
  { fg: 'ivory', bg: 'ink', min: 4.5, use: '다크 섹션 본문' },
  { fg: 'mint', bg: 'ink', min: 4.5, use: '다크 섹션 상태·포인트 텍스트' },
  { fg: 'blue-on-dark', bg: 'ink', min: 4.5, use: '다크 섹션 링크·보조 텍스트' },
  { fg: 'accent', bg: 'ink', min: 4.5, use: '다크 섹션 강조 텍스트' },
  { fg: 'on-accent', bg: 'accent', min: 4.5, use: 'Coral CTA 버튼 라벨' },
  { fg: 'ivory', bg: 'ink-soft', min: 4.5, use: '다크 카드 본문' },
];

/**
 * 텍스트로 절대 쓰면 안 되는 조합 (PLAN.md §11.1).
 * 대비가 우연히 좋아지더라도 규칙을 유지하기 위해 "미달임"을 명시적으로 확인한다.
 */
const FORBIDDEN_TEXT = [
  { fg: 'accent', bg: 'ivory' },
  { fg: 'mint', bg: 'ivory' },
  { fg: 'blue', bg: 'ivory' },
  { fg: 'blue', bg: 'ink' },
];

const tokens = readColorTokens();
let failed = 0;

console.log('토큰 대비 검사 (WCAG AA)\n');
for (const { fg, bg, min, use } of RULES) {
  const [f, b] = [tokens[fg], tokens[bg]];
  if (!f || !b) {
    console.error(`✗ 토큰 없음: --color-${fg} / --color-${bg}`);
    failed++;
    continue;
  }
  const ratio = contrast(f, b);
  const ok = ratio >= min;
  if (!ok) failed++;
  console.log(
    `${ok ? '✓' : '✗'} ${`${fg} on ${bg}`.padEnd(28)} ${ratio.toFixed(2).padStart(5)}:1 (min ${min})  ${use}`,
  );
}

console.log('\n텍스트 사용 금지 조합 확인 (PLAN.md §11.1)\n');
for (const { fg, bg } of FORBIDDEN_TEXT) {
  const ratio = contrast(tokens[fg], tokens[bg]);
  console.log(`  ${`${fg} on ${bg}`.padEnd(28)} ${ratio.toFixed(2).padStart(5)}:1 — 텍스트 금지, 그래픽 전용`);
}

if (failed > 0) {
  console.error(`\n대비 검사 실패: ${failed}건`);
  process.exit(1);
}
console.log('\n대비 검사 통과');
