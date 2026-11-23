# 李慧慧 · 作品集（静态站点）

纯静态站点：HTML + CSS + 原生 JS，无构建步骤、无后端、无外部依赖（字体和图片都在仓库里）。
整个目录直接就是线上内容，`index.html` 是首页。

## 页面

| 文件 | 内容 |
| --- | --- |
| `index.html` | 首页：封面纸叠档案、关于慧慧、生活观察、绘画与书法（11 件作品 + 大图查看）、粉色夹板工牌 |
| `brand.html` | 品牌内容档案（BABLOV / 矩阵号案例） |
| `creator.html` | 达人合作笔记 |
| `personal.html` | 我的生活观察簿 |
| `about.html` | 独立关于页 |

## 目录

```
art/           11 张绘画作品（原图，单张 1-5MB）
works/         作品内页配图（19 张，来自 paper-portfolio/dist/assets）
*.css *.js     各页面样式与交互
TaoBaoMaiCaiTi-Regular.woff2   封面标题字体（淘宝买菜体）
home-*.png     封面与介绍用的位图素材
.nojekyll      关闭 GitHub Pages 的 Jekyll 处理，保证原样输出
```

## 本地预览

```bash
cd huihui-portfolio
python3 -m http.server 4180
# 打开 http://127.0.0.1:4180/
```

## 更新与发布

> **最简单的办法**：桌面上有个「一键更新作品集.command」，改完东西双击它就行，会自动同步 + 提交 + 推送，然后告诉你几分钟后生效。

站点托管在 GitHub Pages，**来源是 `main` 分支根目录 `build_type: legacy`**：
push 到 `main` 后 GitHub 会自动重建并发布，不需要本地构建。

线上地址：https://pingpingli-27.github.io/huihui-portfolio/

方式一（推荐，从设计稿同步）：

```bash
cd huihui-portfolio
./sync.sh          # 把 作品集/.work/chapter-previews 的最新改动同步进来、提交并推送
```

方式二（直接改）：

```bash
cd huihui-portfolio
# 编辑 index.html / *.css / art 里的图片……
git add -A && git commit -m "改了什么" && git push
```

推送后 1-2 分钟线上生效（浏览器有缓存时强制刷新 ⌘⇧R）。
构建状态可在这里看：仓库 **Actions** 页里没有流程，看 `Settings → Pages` 顶部的部署记录，
或者命令行 `gh api repos/pingpingli-27/huihui-portfolio/pages/builds/latest --jq .status`。

> 之所以用分支部署而不是 GitHub Actions：当前 `gh` 的 OAuth token 没有 `workflow` 权限，
> 无法推送 `.github/workflows/*.yml`。想要 Actions 流水线的话，先执行
> `gh auth refresh -s workflow`，再把工作流加回来并改 Pages 的 `build_type` 为 `workflow`。


## 已知问题

- `home-art.css` 引用了 `home-bio-empty-pocket.png`，这个文件在源目录里就不存在。
  它只影响「抽出工牌」时底板上那块补丁（平时 `opacity: 0` 不可见），线上会有一个 404 请求。
  拿到原图后放进根目录即可。
- `art/` 里是原图，合计约 37MB，首次滚动到作品区会稍慢。后续可压成 WebP / 生成缩略图。
