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
      { text: 'AI', link: '/ai/' },
      { text: '交易学习', link: '/trading/' },
      { text: '计算机经验', link: '/computer/' },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/ai/': [
        {
          text: 'AI',
          items: [
            { text: '板块首页', link: '/ai/' },
            {
              text: '使用教程',
              link: '/ai/tutorials/',
              items: [
                { text: 'Codex 安装使用', link: '/ai/tutorials/codex' }
              ]
            }
          ]
        }
      ],
      '/trading/': [
        {
          text: '交易学习',
          items: [
            { text: '板块首页', link: '/trading/' },
            {
              text: '高手思路',
              link: '/trading/experts/',
              items: [
                { text: '奇衡dk', link: '/trading/experts/qiheng-dk' },
                { text: '小翠', link: '/trading/experts/xiaocui' }
              ]
            }
          ]
        }
      ],
      '/computer/': [
        {
          text: '计算机经验',
          items: [
            { text: '板块首页', link: '/computer/' }
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
