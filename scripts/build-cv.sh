#!/usr/bin/env bash
# Builds cv.pdf from index.html using the page's print styles (headless Edge/Chrome).
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
candidates=(
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  "/c/Program Files/Microsoft/Edge/Application/msedge.exe"
  "/c/Program Files/Google/Chrome/Application/chrome.exe"
  "$(command -v google-chrome 2>/dev/null || true)"
  "$(command -v chromium 2>/dev/null || true)"
)

browser=""
for c in "${candidates[@]}"; do
  if [ -n "$c" ] && [ -x "$c" ]; then browser="$c"; break; fi
done
if [ -z "$browser" ]; then
  echo "Edge/Chrome not found" >&2
  exit 1
fi

if command -v cygpath >/dev/null 2>&1; then
  page="file:///$(cygpath -m "$root/index.html")"
  out="$(cygpath -w "$root/cv.pdf")"
else
  page="file://$root/index.html"
  out="$root/cv.pdf"
fi

"$browser" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=8000 --print-to-pdf="$out" "$page"
echo "cv.pdf written"
