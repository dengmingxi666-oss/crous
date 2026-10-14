# 在 Render 部署校味公开体验版

本配置发布 docs/index.html，自包含 HTML，无需安装依赖或运行 Node、Wrangler、Cloudflare Worker。访客无需登录 ChatGPT，首次进入选择学生或商家模拟身份。

## 手动部署

在 Render Dashboard 点击 New → Static Site，连接 dengmingxi666-oss/xiaowei：

| 字段 | 值 |
| --- | --- |
| Branch | main |
| Root Directory | docs |
| Build Command | test -s index.html |
| Publish Directory | . |
| Environment Variable | SKIP_INSTALL_DEPS=true |

点击 Create Static Site，等待部署成功，然后使用 Render 页面实际显示的 onrender.com 地址。静态站点没有 Start Command。

## 使用 Blueprint

仓库根目录 render.yaml 已包含上述设置。New → Blueprint → 选择仓库和 main → 检查配置 → 创建。手动方式和 Blueprint 二选一，避免创建重复站点。新增文件不会自动将已有 Web Service 转为 Static Site。

## 截图报错说明

2026-10-14 的日志显示 workerd 抛出 incoming RPC message exceeds size limit。原 package.json 的 start 使用 wrangler dev、Cloudflare 本地 Worker 与平台账号环境，不能当作 Render 上通用的生产 Node 服务启动。截图只展示了部分日志，不能单凭该片段确定 RPC 超限的完整触发原因。

用 Static Site 发布自包含版本可避开这条 Worker 启动链路。不要在这个静态站点填 npm start、pnpm build 或原 Worker 启动命令。

## 数据与功能范围

- 菜品搜索、分类、地图、点评打卡、饮食偏好、规则推荐、学生与商家模拟操作可体验。
- 数据使用当前浏览器存储；不同用户之间不共享真实订单、点评或商家菜品。
- 不包含 Sites 的云端快照、ChatGPT 登录或 Cloudflare D1。
- 地图布局、人流、预约和送寝是模拟；用餐助手没有接入大模型。

如需多人共享真实业务数据，需要另外迁移身份与数据库后端；仅发布本文件不会提供这些能力。

## 更新

业务代码变更后，运行 node scripts/make-demo.mjs 并提交更新后的 docs/index.html。Render 自动部署 main 中 docs 的变更；手动重新部署可在服务页面选择 Manual Deploy → Deploy latest commit。

官方资料：
- https://render.com/docs/static-sites
- https://render.com/docs/monorepo-support
- https://render.com/docs/blueprint-spec
