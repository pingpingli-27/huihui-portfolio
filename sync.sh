#!/usr/bin/env bash
# 把源目录里最新的页面同步到本仓库，然后提交并推送（推送后 GitHub Actions 自动发布）
# 用法：./sync.sh
set -euo pipefail

SRC="${1:-/Users/hh/Documents/ChatGPT/作品集/.work/chapter-previews}"
DST="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "$SRC" ]; then
  echo "源目录不存在：$SRC" >&2
  exit 1
fi

# 首页：源文件名 home-interactions.html 在线上叫 index.html
python3 - "$SRC/home-interactions.html" "$DST/index.html" <<'PY'
import re, sys
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

cp "$SRC/brand.html" "$SRC/creator.html" "$SRC/personal.html" "$SRC/about.html" "$DST/"
cp "$SRC/home-scroll.css" "$SRC/home-art.css" "$SRC/home-cover.css" \
   "$SRC/paper.css" "$SRC/creator.css" "$SRC/about.css" "$DST/"
cp "$SRC/home-scroll.js" "$SRC/home-art.js" "$SRC/about.js" "$DST/"
cp "$SRC/TaoBaoMaiCaiTi-Regular.woff2" "$DST/"
cp "$SRC/bedside.png" "$SRC/home-badge.png" "$SRC/home-bio.png" \
   "$SRC/home-cover.png" "$SRC/maicai-cover-paper.png" "$SRC/umbrella.png" "$DST/"

# art/ 与 works/ 整目录同步（works 原本是指向 paper-portfolio/dist/assets 的软链，线上必须是真实目录）
rsync -a --delete "$SRC/art/" "$DST/art/"
rsync -a --delete "/Users/hh/Documents/ChatGPT/作品集/paper-portfolio/dist/assets/" "$DST/works/"

cd "$DST"
git add -A
if git diff --cached --quiet; then
  echo "没有内容变化，跳过提交。"
  exit 0
fi
git commit -m "sync: 更新站点内容 $(date '+%Y-%m-%d %H:%M')"
git push
echo "已推送，GitHub Pages 会在 1-2 分钟内重新发布：https://pingpingli-27.github.io/huihui-portfolio/"
