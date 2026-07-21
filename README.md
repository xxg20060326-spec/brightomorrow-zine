# BRIGHTomorrow 中文 Zine

这是 BRIGHTomorrow 的可维护静态网站版本，适合托管在 GitHub Pages。

## 修改杂志内容

- 在 `content/articles.json` 修改文章标题、栏目、作者、日期、颜色与版面尺寸。
- 在 `content/articles/01.md` 至 `06.md` 填写对应正文。
- 保存到 `main` 分支后，GitHub Pages 会重新发布网站。

正文支持：

- `#`、`##`、`###` 标题
- 普通段落
- `**粗体**` 与 `*斜体*`
- `> 引用`
- `- 列表`

## 修改网页设计或功能

- `index.html`：页面结构
- `styles.css`：全部视觉样式与手机适配
- `app.js`：文章读取、Markdown 渲染与页面交互

## 添加协作者

仓库管理员可前往 `Settings → Collaborators`，邀请编辑或开发者。给予 `Write` 权限后，对方可以修改文章与网页代码。

## 启用 GitHub Pages

进入仓库 `Settings → Pages`：

1. `Source` 选择 `Deploy from a branch`。
2. 分支选择 `main`。
3. 文件夹选择 `/ (root)`。
4. 点击 `Save`。

网站地址将显示在同一页面。
