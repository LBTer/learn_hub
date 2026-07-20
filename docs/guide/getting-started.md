# 开始使用

这个站点用于记录个人教程和知识笔记。

## 启动开发环境

```bash
npm install
npm run docs:dev
```

访问终端中显示的本地地址，即可实时预览内容。

## 新增一篇教程

1. 在 `docs/guide/` 下创建 Markdown 文件。
2. 使用标题、段落、列表和代码块编写内容。
3. 在 `docs/.vitepress/config.mts` 中为页面添加侧边栏入口。
4. 提交并推送代码，GitHub Actions 会自动更新线上站点。

## Markdown 示例

```md
# 页面标题

这里是正文。

## 小节

- 知识点一
- 知识点二
```
