import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Learn Hub',
  description: '个人教程与知识整理站',
  base: '/learn_hub/',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '教程', link: '/guide/getting-started' },
      { text: '知识库', link: '/notes/' },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '教程',
          items: [
            { text: '开始使用', link: '/guide/getting-started' }
          ]
        }
      ],
      '/notes/': [
        {
          text: '知识库',
          items: [
            { text: '知识库首页', link: '/notes/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/' }
    ],

    footer: {
      message: '使用 VitePress 构建',
      copyright: `Copyright © ${new Date().getFullYear()} Learn Hub`
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: '页面导航'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    lastUpdated: {
      text: '最后更新于'
    }
  }
})
