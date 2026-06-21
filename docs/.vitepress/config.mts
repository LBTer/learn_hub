import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  lang: 'zh-CN',
  title: 'Learn Hub',
  description: '个人教程与知识整理站',
  base: '/learn_hub/',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: 'AI',
        items: [
          { text: '板块首页', link: '/ai/' },
          { text: '使用教程', link: '/ai/tutorials/' },
          { text: 'Codex 安装使用', link: '/ai/tutorials/codex' }
        ]
      },
      {
        text: '交易学习',
        items: [
          { text: '板块首页', link: '/trading/' },
          { text: '高手思路', link: '/trading/experts/' },
          { text: '奇衡dk', link: '/trading/experts/qiheng-dk' },
          {
            text: '小翠',
            items: [
              { text: '人物首页', link: '/trading/experts/xiaocui/' },
              {
                text: '分析框架',
                link: '/trading/experts/xiaocui/analysis-framework/'
              },
              {
                text: '交易日总结',
                link: '/trading/experts/xiaocui/trading-days/'
              },
              {
                text: '视频文字稿',
                link: '/trading/experts/xiaocui/transcripts/'
              },
              {
                text: '会员专题',
                link: '/trading/experts/xiaocui/member-sessions/'
              },
              {
                text: '会员视频文字稿',
                link: '/trading/experts/xiaocui/member-transcripts/'
              }
            ]
          },
          {
            text: '比巴卜作手',
            items: [
              {
                text: '人物首页',
                link: '/trading/experts/bibabu-zuoshou/'
              },
              {
                text: '技术点学习',
                link: '/trading/experts/bibabu-zuoshou/technical-notes/'
              },
              {
                text: '交易日总结',
                link: '/trading/experts/bibabu-zuoshou/trading-days/'
              },
              {
                text: '视频文字稿',
                link: '/trading/experts/bibabu-zuoshou/transcripts/'
              },
              {
                text: '充电会员主题',
                link: '/trading/experts/bibabu-zuoshou/member-topics/'
              }
            ]
          }
        ]
      },
      {
        text: '计算机经验',
        items: [
          { text: '板块首页', link: '/computer/' },
          { text: '打工经历', link: '/computer/work-experience/' },
          { text: '公司B', link: '/computer/work-experience/company-b/' },
          {
            text: '算法',
            items: [
              {
                text: '自动批改',
                items: [
                  {
                    text: '流程思考',
                    link: '/computer/work-experience/company-b/algorithm/automatic-grading/process-design'
                  }
                ]
              },
              {
                text: 'AI 组题',
                link: '/computer/work-experience/company-b/algorithm/ai-question-generation/'
              },
              {
                text: '相似题推荐',
                link: '/computer/work-experience/company-b/algorithm/ai-question-generation/similar-questions'
              },
              {
                text: '部署计划',
                link: '/computer/work-experience/company-b/algorithm/ai-question-generation/deployment-plan'
              }
            ]
          },
          {
            text: '后端',
            items: [
              {
                text: 'PostgreSQL 同步至 Elasticsearch',
                link: '/computer/work-experience/company-b/backend/elasticsearch/postgresql-sync'
              },
              {
                text: 'Elasticsearch 查询与深分页',
                link: '/computer/work-experience/company-b/backend/elasticsearch/query-and-pagination'
              },
              {
                text: '流水线拉取 Git 子模块',
                link: '/computer/work-experience/company-b/backend/ci-cd/git-submodules'
              },
              {
                text: 'Metabase 与 ClickHouse 部署',
                link: '/computer/work-experience/company-b/backend/service-management/metabase-deployment'
              }
            ]
          }
        ]
      },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/ai/': [
        {
          text: 'AI',
          collapsed: true,
          items: [
            { text: '板块首页', link: '/ai/' },
            {
              text: '使用教程',
              link: '/ai/tutorials/',
              collapsed: true,
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
          collapsed: true,
          items: [
            { text: '板块首页', link: '/trading/' },
            {
              text: '高手思路',
              link: '/trading/experts/',
              collapsed: true,
              items: [
                { text: '奇衡dk', link: '/trading/experts/qiheng-dk' },
                {
                  text: '小翠',
                  link: '/trading/experts/xiaocui/',
                  collapsed: true,
                  items: [
                    {
                      text: '分析框架',
                      link: '/trading/experts/xiaocui/analysis-framework/'
                    },
                    {
                      text: '交易日总结',
                      link: '/trading/experts/xiaocui/trading-days/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-18',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-18'
                        },
                        {
                          text: '2026-06-17',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-17'
                        },
                        {
                          text: '2026-06-16',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-16'
                        },
                        {
                          text: '2026-06-15',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-15'
                        },
                        {
                          text: '2026-06-12',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-12'
                        },
                        {
                          text: '2026-06-11',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-11'
                        },
                        {
                          text: '2026-06-10',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-10'
                        },
                        {
                          text: '2026-06-09',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-09'
                        }
                      ]
                    },
                    {
                      text: '视频文字稿',
                      link: '/trading/experts/xiaocui/transcripts/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-18',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-18'
                        },
                        {
                          text: '2026-06-17',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-17'
                        },
                        {
                          text: '2026-06-16',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-16'
                        },
                        {
                          text: '2026-06-15',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-15'
                        },
                        {
                          text: '2026-06-12',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-12'
                        },
                        {
                          text: '2026-06-11',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-11'
                        },
                        {
                          text: '2026-06-10',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-10'
                        },
                        {
                          text: '2026-06-09',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-09'
                        }
                      ]
                    },
                    {
                      text: '会员专题',
                      link: '/trading/experts/xiaocui/member-sessions/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-19',
                          link: '/trading/experts/xiaocui/member-sessions/2026-06-19'
                        },
                        {
                          text: '2026-06-12',
                          link: '/trading/experts/xiaocui/member-sessions/2026-06-12'
                        },
                        {
                          text: '2026-06-05',
                          link: '/trading/experts/xiaocui/member-sessions/2026-06-05'
                        }
                      ]
                    },
                    {
                      text: '会员视频文字稿',
                      link: '/trading/experts/xiaocui/member-transcripts/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-19',
                          link: '/trading/experts/xiaocui/member-transcripts/2026-06-19'
                        },
                        {
                          text: '2026-06-12',
                          link: '/trading/experts/xiaocui/member-transcripts/2026-06-12'
                        },
                        {
                          text: '2026-06-05',
                          link: '/trading/experts/xiaocui/member-transcripts/2026-06-05'
                        }
                      ]
                    }
                  ]
                },
                {
                  text: '比巴卜作手',
                  link: '/trading/experts/bibabu-zuoshou/',
                  collapsed: true,
                  items: [
                    {
                      text: '技术点学习',
                      link: '/trading/experts/bibabu-zuoshou/technical-notes/'
                    },
                    {
                      text: '交易日总结',
                      link: '/trading/experts/bibabu-zuoshou/trading-days/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-17',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-17'
                        },
                        {
                          text: '2026-06-15',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-15'
                        },
                        {
                          text: '2026-06-12',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-12'
                        },
                        {
                          text: '2026-06-11',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-11'
                        },
                        {
                          text: '2026-06-10',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-10'
                        },
                        {
                          text: '2026-06-09',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-09'
                        }
                      ]
                    },
                    {
                      text: '视频文字稿',
                      link: '/trading/experts/bibabu-zuoshou/transcripts/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-17',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-17'
                        },
                        {
                          text: '2026-06-15',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-15'
                        },
                        {
                          text: '2026-06-12',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-12'
                        },
                        {
                          text: '2026-06-11',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-11'
                        }
                      ]
                    },
                    {
                      text: '充电会员主题',
                      link: '/trading/experts/bibabu-zuoshou/member-topics/',
                      collapsed: true,
                      items: [
                        {
                          text: '充电会员复盘',
                          link: '/trading/experts/bibabu-zuoshou/member-topics/reviews/',
                          collapsed: true,
                          items: [
                            {
                              text: '2026-06-16',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/reviews/2026-06-16-BV1StjG68ExA'
                            }
                          ]
                        },
                        {
                          text: '充电会员复盘文字稿',
                          link: '/trading/experts/bibabu-zuoshou/member-topics/review-transcripts/',
                          collapsed: true,
                          items: [
                            {
                              text: '2026-06-16',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/review-transcripts/2026-06-16-BV1StjG68ExA'
                            }
                          ]
                        },
                        {
                          text: '游资交易系统',
                          link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/',
                          collapsed: true,
                          items: [
                            {
                              text: '第 1 课：短线交易入门',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/01-short-term-trading-introduction'
                            }
                          ]
                        },
                        {
                          text: '游资交易系统文字稿',
                          link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/',
                          collapsed: true,
                          items: [
                            {
                              text: '第 1 课：短线交易入门',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/01-short-term-trading-introduction'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      '/computer/': [
        {
          text: '计算机经验',
          collapsed: true,
          items: [
            { text: '板块首页', link: '/computer/' },
            {
              text: '打工经历',
              link: '/computer/work-experience/',
              collapsed: true,
              items: [
                {
                  text: '公司B',
                  link: '/computer/work-experience/company-b/',
                  collapsed: true,
                  items: [
                    {
                      text: '算法',
                      link: '/computer/work-experience/company-b/algorithm/',
                      collapsed: true,
                      items: [
                        {
                          text: '自动批改',
                          link: '/computer/work-experience/company-b/algorithm/automatic-grading/',
                          collapsed: true,
                          items: [
                            {
                              text: '流程思考',
                              link: '/computer/work-experience/company-b/algorithm/automatic-grading/process-design'
                            }
                          ]
                        },
                        {
                          text: 'AI 组题',
                          link: '/computer/work-experience/company-b/algorithm/ai-question-generation/',
                          collapsed: true,
                          items: [
                            {
                              text: '相似题推荐',
                              link: '/computer/work-experience/company-b/algorithm/ai-question-generation/similar-questions'
                            },
                            {
                              text: '部署计划',
                              link: '/computer/work-experience/company-b/algorithm/ai-question-generation/deployment-plan'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      text: '后端',
                      link: '/computer/work-experience/company-b/backend/',
                      collapsed: true,
                      items: [
                        {
                          text: 'Elasticsearch',
                          link: '/computer/work-experience/company-b/backend/elasticsearch/',
                          collapsed: true,
                          items: [
                            {
                              text: 'PostgreSQL 数据同步',
                              link: '/computer/work-experience/company-b/backend/elasticsearch/postgresql-sync'
                            },
                            {
                              text: '查询与深分页',
                              link: '/computer/work-experience/company-b/backend/elasticsearch/query-and-pagination'
                            }
                          ]
                        },
                        {
                          text: 'CI/CD',
                          link: '/computer/work-experience/company-b/backend/ci-cd/',
                          collapsed: true,
                          items: [
                            {
                              text: 'Git 子模块',
                              link: '/computer/work-experience/company-b/backend/ci-cd/git-submodules'
                            }
                          ]
                        },
                        {
                          text: '服务管理',
                          link: '/computer/work-experience/company-b/backend/service-management/',
                          collapsed: true,
                          items: [
                            {
                              text: 'Metabase 与 ClickHouse 部署',
                              link: '/computer/work-experience/company-b/backend/service-management/metabase-deployment'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
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
      level: [2, 4],
      label: '页面导航'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    lastUpdated: {
      text: '最后更新于'
    }
  },

  mermaid: {
    theme: 'default',
    themeVariables: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
    }
  },
  mermaidPlugin: {
    class: 'mermaid'
  }
}))
