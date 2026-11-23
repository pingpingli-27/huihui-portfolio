#!/usr/bin/env bash
# 把最新改动同步到线上作品集：谁新用谁，然后提交、推送、发布到 Cloudflare Pages
# 用法：./sync.sh
#
# 设计原则：**只覆盖更旧的，绝不覆盖更新的**。
#   - 改了设计稿目录 chapter-previews → 会同步过来
#   - 直接改了 huihui-portfolio 里的文件 → 不会被设计稿的旧版本盖掉
# 所以不管是在哪一边改的，双击桌面那个文件都是安全的。
set -euo pipefail

SRC="${1:-/Users/hh/Documents/ChatGPT/作品集/.work/chapter-previews}"
DST="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "$SRC" ]; then
  echo "源目录不存在：$SRC" >&2
  exit 1
fi

CHANGED=0

# 只有源文件比目标新（或目标不存在）才复制
copy_newer() {
  local s="$1" d="$2"
  [ -f "$s" ] || return 0
  if [ ! -f "$d" ] || [ "$s" -nt "$d" ]; then
    cp -p "$s" "$d"
    echo "  同步 $(basename "$d")"
    CHANGED=1
  fi
}

# 首页：源文件名 home-interactions.html 在线上叫 index.html，且要补 SEO 信息
if [ ! -f "$DST/index.html" ] || [ "$SRC/home-interactions.html" -nt "$DST/index.html" ]; then
  python3 - "$SRC/home-interactions.html" "$DST/index.html" <<'PY'
import sys
src, dst = sys.argv[1], sys.argv[2]
html = open(src, encoding="utf-8").read()
html = html.replace(
    "<title>李慧慧 · 首页互动预览</title>",
    '<title>李慧慧 · 作品集｜内容运营与达人商务</title>\n'
    '  <meta name="description" content="李慧慧的个人作品集：品牌内容档案、达人合作笔记、生活观察簿与绘画书法。">\n'
    '  <meta property="og:title" content="李慧慧 · 作品集">\n'
    '  <meta property="og:description" content="品牌内容档案、达人合作笔记、生活观察簿与绘画书法。">\n'
    '  <meta property="og:type" content="website">'
)
open(dst, "w", encoding="utf-8").write(html)
PY
  echo "  同步 index.html"
  CHANGED=1
fi

for f in brand.html creator.html personal.html about.html \
         home-scroll.css home-art.css home-cover.css paper.css creator.css about.css \
         home-scroll.js home-art.js about.js TaoBaoMaiCaiTi-Regular.woff2 \
         bedside.png home-badge.png home-bio.png home-cover.png maicai-cover-paper.png umbrella.png; do
  copy_newer "$SRC/$f" "$DST/$f"
done

# art/ 与 works/ 整目录同步；-u = 只补更新的，不删、不覆盖更新的
rsync -au "$SRC/art/" "$DST/art/"
rsync -au "/Users/hh/Documents/ChatGPT/作品集/paper-portfolio/dist/assets/" "$DST/works/"

cd "$DST"
git add -A
if git diff --cached --quiet; then
  echo "没有内容变化，跳过提交。"
  exit 0
fi

echo ""
echo "本次改动："
git diff --cached --stat | tail -12

git commit -q -m "sync: 更新站点内容 $(date '+%Y-%m-%d %H:%M')"
git push -q
echo ""
echo "已推送，GitHub Pages 会在 1-2 分钟内重新发布。"

# ---- 同步发布到 Cloudflare Pages ----
WR="$HOME/.local/wrangler/node_modules/.bin/wrangler"
if [ -x "$WR" ]; then
  echo ""
  echo "正在发布到 Cloudflare Pages…"
  rm -rf /tmp/cf-site && mkdir -p /tmp/cf-site
  rsync -a --exclude '.git' --exclude '.github' ./ /tmp/cf-site/
  if "$WR" pages deploy /tmp/cf-site --project-name huihui-portfolio \
       --branch main --commit-dirty=true 2>&1 | tail -3; then
    echo "Cloudflare Pages 已更新：https://huihui-portfolio.pages.dev/"
  else
    echo "⚠️ Cloudflare 发布失败（GitHub Pages 那个地址不受影响），可以稍后重跑一次。"
  fi
fi
