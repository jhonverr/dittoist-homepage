#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

readonly DEPLOY_HOST="${DITTOIST_DEPLOY_HOST:-dtalk}"
readonly SITE_URL="${DITTOIST_SITE_URL:-https://dittoist.com}"
readonly DEPLOY_ROOT="/var/www/dittoist-homepage"
readonly RELEASES_ROOT="$DEPLOY_ROOT/releases"
readonly CURRENT_LINK="$DEPLOY_ROOT/current"

log() {
  printf '\n==> %s\n' "$1"
}

fail() {
  printf '\n오류: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "필요한 명령을 찾을 수 없습니다: $1"
}

if (( $# == 0 )); then
  printf '사용법: npm run publish -- "커밋 메시지"\n' >&2
  exit 2
fi

readonly COMMIT_MESSAGE="$*"
readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

for command_name in git npm ssh rsync curl; do
  require_command "$command_name"
done

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Git 저장소가 아닙니다."

readonly BRANCH="$(git branch --show-current)"
[[ "$BRANCH" == "main" ]] || fail "main 브랜치에서만 게시할 수 있습니다. 현재 브랜치: $BRANCH"
git remote get-url origin >/dev/null 2>&1 || fail "origin 원격 저장소가 없습니다."

if [[ -n "$(git diff --name-only --diff-filter=U)" ]]; then
  fail "해결되지 않은 Git 충돌이 있습니다."
fi
git diff --check
git diff --cached --check

log "Astro 검사"
npm run check
npm run check:contrast
npm run build
[[ -s dist/index.html ]] || fail "빌드 결과 dist/index.html이 없습니다."

log "변경 사항 스테이징"
git add -A
git diff --cached --check

while IFS= read -r -d '' staged_path; do
  case "$staged_path" in
    .env|.env.*|*/.env|*/.env.*)
      [[ "$staged_path" == ".env.example" ]] || fail "민감한 환경 파일은 게시할 수 없습니다: $staged_path"
      ;;
    *.pem|*.key|*.p12|*.pfx|*credentials*|*secret*)
      fail "민감할 수 있는 파일은 게시할 수 없습니다: $staged_path"
      ;;
  esac
done < <(git diff --cached --name-only -z)

if git diff --cached --quiet; then
  echo "커밋할 변경 사항이 없어 기존 HEAD를 배포합니다."
else
  git diff --cached --stat
  git commit -m "$COMMIT_MESSAGE"
fi

log "GitHub main 푸시"
git push origin main

readonly COMMIT_SHA="$(git rev-parse HEAD)"
readonly SHORT_SHA="$(git rev-parse --short=8 HEAD)"
readonly RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)-$SHORT_SHA"
readonly RELEASE_DIR="$RELEASES_ROOT/$RELEASE_ID"

log "서버 사전 점검"
ssh -o BatchMode=yes "$DEPLOY_HOST" \
  "test \"\$(id -u)\" -eq 0 && id dittoist >/dev/null && getent group caddy >/dev/null && systemctl is-active --quiet caddy"

log "릴리스 업로드: $RELEASE_ID"
ssh "$DEPLOY_HOST" \
  "install -d -o dittoist -g caddy -m 0750 '$DEPLOY_ROOT' '$RELEASES_ROOT' '$RELEASE_DIR'"
rsync -a --delete \
  --chown=dittoist:caddy \
  --chmod=D750,F640 \
  dist/ "$DEPLOY_HOST:$RELEASE_DIR/"
ssh "$DEPLOY_HOST" "test -s '$RELEASE_DIR/index.html'"

previous_release="$(ssh "$DEPLOY_HOST" "readlink '$CURRENT_LINK'")"
readonly PREVIOUS_RELEASE="$previous_release"
readonly NEXT_LINK="$DEPLOY_ROOT/current.$RELEASE_ID.next"

log "릴리스 활성화"
ssh "$DEPLOY_HOST" \
  "runuser -u dittoist -- ln -s 'releases/$RELEASE_ID' '$NEXT_LINK' && mv -Tf '$NEXT_LINK' '$CURRENT_LINK'"

health_check() {
  local path
  for path in / /work/ /contact/; do
    curl --fail --silent --show-error \
      --retry 3 --retry-delay 1 --max-time 15 \
      "$SITE_URL$path" >/dev/null || return 1
  done
}

log "공개 사이트 확인"
if ! health_check; then
  printf '새 릴리스 확인 실패. 이전 릴리스로 복구합니다.\n' >&2
  if [[ "$PREVIOUS_RELEASE" =~ ^releases/[A-Za-z0-9._-]+$ ]]; then
    readonly ROLLBACK_LINK="$DEPLOY_ROOT/current.$RELEASE_ID.rollback"
    ssh "$DEPLOY_HOST" \
      "runuser -u dittoist -- ln -s '$PREVIOUS_RELEASE' '$ROLLBACK_LINK' && mv -Tf '$ROLLBACK_LINK' '$CURRENT_LINK'"
    fail "배포에 실패해 $PREVIOUS_RELEASE 상태로 복구했습니다."
  fi
  fail "배포 확인에 실패했고 안전한 이전 릴리스를 찾지 못했습니다."
fi

printf '\n게시 완료\n'
printf '  Git commit: %s\n' "$COMMIT_SHA"
printf '  Release:    %s\n' "$RELEASE_DIR"
printf '  Website:    %s\n' "$SITE_URL"
