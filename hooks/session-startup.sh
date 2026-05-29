#!/bin/bash
# Atlas session startup hook — runs on every UserPromptSubmit.
# Heavy tasks (npm audit) run once per day via stamp.
# Light status context is always output so Claude has situational awareness.
# TEMP: Disabled while investigating WSL restart issue. Remove this exit when done.
exit 0

ATLAS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$ATLAS_DIR/logs/audit-last-run.txt"
TODAY=$(date -u +%Y-%m-%d)
NOW=$(date -u +"%H:%M:%SZ")

mkdir -p "$ATLAS_DIR/logs/sessions"

# --- Always: log session entry ---
SESSION_LOG="$ATLAS_DIR/logs/sessions/$TODAY.md"
if [ ! -f "$SESSION_LOG" ]; then
  echo "# Session Log — $TODAY" > "$SESSION_LOG"
fi
echo "- $NOW Session started" >> "$SESSION_LOG"

# --- Always: quick status checks ---
QUEUE_COUNT=$(ls "$ATLAS_DIR/tasks/queue/"*.md 2>/dev/null | wc -l | tr -d ' ')
ACTIVE_COUNT=$(ls "$ATLAS_DIR/tasks/active/"*.md 2>/dev/null | wc -l | tr -d ' ')

OVERDUE_CHORES=0
if [ -f "$ATLAS_DIR/data/organizer/chores.json" ]; then
  OVERDUE_CHORES=$(node -e "
try {
  const d = JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));
  const t = '$TODAY';
  process.stdout.write(String((d.chores||[]).filter(c => c.status !== 'done' && c.next_due && c.next_due <= t).length));
} catch(e) { process.stdout.write('0'); }
" "$ATLAS_DIR/data/organizer/chores.json" 2>/dev/null || echo 0)
fi

DUE_TODOS=0
if [ -f "$ATLAS_DIR/data/organizer/user-todos.json" ]; then
  DUE_TODOS=$(node -e "
try {
  const d = JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));
  const t = '$TODAY';
  process.stdout.write(String((d.todos||[]).filter(x => x.status === 'open' && x.due && x.due <= t).length));
} catch(e) { process.stdout.write('0'); }
" "$ATLAS_DIR/data/organizer/user-todos.json" 2>/dev/null || echo 0)
fi

ACTIVE_GOALS=0
GOALS_NO_ACTION=0
if [ -f "$ATLAS_DIR/data/organizer/goals.json" ]; then
  GOALS_DATA=$(node -e "
try {
  const d = JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));
  const active = (d.goals||[]).filter(g => g.status === 'active');
  const noAction = active.filter(g => !g.next_action || g.next_action.trim() === '').length;
  process.stdout.write(active.length + ' ' + noAction);
} catch(e) { process.stdout.write('0 0'); }
" "$ATLAS_DIR/data/organizer/goals.json" 2>/dev/null || echo "0 0")
  ACTIVE_GOALS=$(echo $GOALS_DATA | cut -d' ' -f1)
  GOALS_NO_ACTION=$(echo $GOALS_DATA | cut -d' ' -f2)
fi

SLEEP_REMINDER=""
YESTERDAY=$(date -u -d "yesterday" +%Y-%m-%d 2>/dev/null || date -u -v-1d +%Y-%m-%d 2>/dev/null || echo "")
if [ -n "$YESTERDAY" ] && [ -f "$ATLAS_DIR/data/health/sleep-log.json" ]; then
  SLEEP_LOGGED=$(node -e "
try {
  const d = JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));
  const found = (d.entries||[]).some(e => e.date === '$YESTERDAY');
  process.stdout.write(found ? 'yes' : 'no');
} catch(e) { process.stdout.write('unknown'); }
" "$ATLAS_DIR/data/health/sleep-log.json" 2>/dev/null || echo "unknown")
  if [ "$SLEEP_LOGGED" = "no" ]; then
    SLEEP_REMINDER="sleep log for $YESTERDAY missing"
  fi
fi

# --- Once per day: npm audit ---
VULN_STATUS="not checked today"
if [ -f "$STAMP" ] && [ "$(cat "$STAMP")" = "$TODAY" ]; then
  AUDIT_LOG="$ATLAS_DIR/logs/sessions/audit-$TODAY.log"
  if grep -q "high\|critical" "$AUDIT_LOG" 2>/dev/null; then
    VULN_STATUS="HIGH/CRITICAL found — check audit-$TODAY.log"
  else
    VULN_STATUS="clean (checked earlier today)"
  fi
elif [ ! -f "$STAMP" ] || [ "$(cat "$STAMP")" != "$TODAY" ]; then
  AUDIT_LOG="$ATLAS_DIR/logs/sessions/audit-$TODAY.log"
  echo "=== Atlas Dependency Audit — $TODAY ===" > "$AUDIT_LOG"
  FOUND_VULN=0
  for pkg in "tools/atlas-webapp" "tools/dashboard"; do
    PKG_PATH="$ATLAS_DIR/$pkg"
    if [ -f "$PKG_PATH/package.json" ]; then
      RESULT=$(cd "$PKG_PATH" && npm audit 2>&1)
      echo "--- $pkg ---" >> "$AUDIT_LOG"
      echo "$RESULT" >> "$AUDIT_LOG"
      if echo "$RESULT" | grep -qE "high|critical"; then
        FOUND_VULN=1
      fi
    fi
  done
  echo "$TODAY" > "$STAMP"
  if [ "$FOUND_VULN" -eq 1 ]; then
    VULN_STATUS="HIGH/CRITICAL vulnerabilities found — check logs/sessions/audit-$TODAY.log"
  else
    VULN_STATUS="clean"
  fi
fi

# --- Ops / maintenance status ---
OPS_STATUS=""
if [ -f "$ATLAS_DIR/data/ops/maintenance.flag" ]; then
  OPS_STATUS="MAINTENANCE MODE ACTIVE"
elif [ -f "$ATLAS_DIR/data/ops/app-status.json" ]; then
  OPS_STATUS=$(node -e "
try {
  const d = JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));
  const now = new Date().toISOString();
  const upcoming = (d.maintenance_windows||[]).filter(w => w.end > now);
  if (upcoming.length) {
    const next = upcoming.sort((a,b) => a.start.localeCompare(b.start))[0];
    process.stdout.write('maintenance window: ' + next.start + ' — ' + (next.reason||'no reason'));
  }
} catch(e) {}
" "$ATLAS_DIR/data/ops/app-status.json" 2>/dev/null || true)
fi

# --- Docker stack health-check and auto-start ---
# Never restarts the Docker daemon — that is systemd's job.
# Only starts the compose stack when the daemon is already running.
STACK_STATUS="docker-unavailable"
export MSYS_NO_PATHCONV=1

# Fast path: app already healthy
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/api/health 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
  STACK_STATUS="running"
elif wsl -d Ubuntu-22.04 -- docker info > /dev/null 2>&1; then
  # Daemon is up — ensure compose stack is running
  wsl -d Ubuntu-22.04 -- docker compose \
    -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml up -d 2>/dev/null
  # Single quick re-check (containers may still be starting)
  HTTP_CODE2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/api/health 2>/dev/null)
  if [ "$HTTP_CODE2" = "200" ]; then
    STACK_STATUS="started"
  else
    STACK_STATUS="starting (allow ~30s for health checks)"
  fi
fi
# If Docker is unavailable, systemd will recover it — nothing to do here.

# --- Output context block for Claude ---
echo "---ATLAS-STARTUP-CONTEXT---"
echo "date: $TODAY  time: $NOW"
echo "tasks: ${QUEUE_COUNT} queued, ${ACTIVE_COUNT} active"
echo "chores overdue: $OVERDUE_CHORES"
echo "todos due/overdue: $DUE_TODOS"
echo "goals: $ACTIVE_GOALS active$([ "$GOALS_NO_ACTION" -gt 0 ] && echo ", $GOALS_NO_ACTION missing next_action" || echo "")"
[ -n "$SLEEP_REMINDER" ] && echo "reminder: $SLEEP_REMINDER"
[ -n "$OPS_STATUS" ] && echo "ops: $OPS_STATUS"
echo "dependencies: $VULN_STATUS"
echo "stack: $STACK_STATUS — http://localhost:3456"
echo "---END-ATLAS-STARTUP-CONTEXT---"

exit 0
