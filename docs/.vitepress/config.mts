import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

function taskListPlugin(md: any) {
  md.core.ruler.after('inline', 'task-lists', (state: any) => {
    const tokens = state.tokens

    for (let index = 0; index < tokens.length; index += 1) {
      const inline = tokens[index]

      if (
        inline.type !== 'inline' ||
        !/^\[[ xX]\]\s+/.test(inline.content)
      ) {
        continue
      }

      let listItemIndex = index - 1
      while (listItemIndex >= 0 && tokens[listItemIndex].type === 'paragraph_open') {
        listItemIndex -= 1
      }
      const listItem = tokens[listItemIndex]

      if (listItem?.type !== 'list_item_open') continue

      const checked = /^\[[xX]\]/.test(inline.content)
      const firstText = inline.children?.find((child: any) => child.type === 'text')

      if (!firstText) continue

      firstText.content = firstText.content.replace(/^\[[ xX]\]\s+/, '')
      inline.children.unshift({
        type: 'html_inline',
        tag: '',
        attrs: null,
        map: null,
        nesting: 0,
        level: inline.level,
        children: null,
        content: `<input class="task-list-item-checkbox" type="checkbox"${checked ? ' checked' : ''} disabled>`,
        markup: '',
        info: '',
        meta: null,
        block: false,
        hidden: false
      })
      listItem.attrJoin('class', 'task-list-item')

      for (let parent = listItemIndex - 1; parent >= 0; parent -= 1) {
        if (tokens[parent].type === 'bullet_list_open') {
          tokens[parent].attrSet('class', 'contains-task-list')
          break
        }
      }
    }
  })
}

export default withMermaid(defineConfig({
  lang: 'zh-CN',
  title: 'Learn Hub',
  description: '个人教程与知识整理站',
  base: '/learn_hub/',
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    config(md) {
      md.use(taskListPlugin)
    }
  },

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
            text: '视野环球财经',
            items: [
              { text: '人物首页', link: '/trading/experts/rhino-finance/' },
              {
                text: '美股盘后复盘',
                link: '/trading/experts/rhino-finance/market-reviews/'
              },
              {
                text: '视频文字稿',
                link: '/trading/experts/rhino-finance/transcripts/'
              },
              {
                text: '公司与 ETF 跟踪',
                link: '/trading/experts/rhino-finance/company-notes/'
              },
              {
                text: '分析框架',
                link: '/trading/experts/rhino-finance/analysis-framework/'
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
                link: '/trading/experts/bibabu-zuoshou/technical-notes/',
                items: [
                  {
                    text: '情绪周期与仓位',
                    link: '/trading/experts/bibabu-zuoshou/technical-notes/emotion-cycle-and-position'
                  },
                  {
                    text: '题材节奏、分歧与回流',
                    link: '/trading/experts/bibabu-zuoshou/technical-notes/theme-rhythm-divergence-return'
                  },
                  {
                    text: '核心票角色分层',
                    link: '/trading/experts/bibabu-zuoshou/technical-notes/core-stock-roles'
                  }
                ]
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
          },
          {
            text: '袁帅马',
            items: [
              { text: '人物首页', link: '/trading/experts/yuanshuaima/' },
              {
                text: '日常分析',
                link: '/trading/experts/yuanshuaima/daily-analysis/'
              },
              {
                text: '视频文字稿',
                link: '/trading/experts/yuanshuaima/transcripts/'
              },
              {
                text: '充电会员主题',
                link: '/trading/experts/yuanshuaima/member-topics/'
              },
              {
                text: '技术点学习',
                link: '/trading/experts/yuanshuaima/technique-notes/'
              }
            ]
          },

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
                          text: '2026-06-26',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-26'
                        },
                        {
                          text: '2026-06-25',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-25'
                        },
                        {
                          text: '2026-06-24',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-24'
                        },
                        {
                          text: '2026-06-23 下集',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-23-A0LudLLnw3Y'
                        },
                        {
                          text: '2026-06-23',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-23'
                        },
                        {
                          text: '2026-06-22',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-22'
                        },
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
                          text: '2026-06-26',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-26'
                        },
                        {
                          text: '2026-06-25',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-25'
                        },
                        {
                          text: '2026-06-24',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-24'
                        },
                        {
                          text: '2026-06-23 下集',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-23-A0LudLLnw3Y'
                        },
                        {
                          text: '2026-06-23',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-23'
                        },
                        {
                          text: '2026-06-22',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-22'
                        },
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
                          text: '2026-06-26 会员',
                          link: '/trading/experts/xiaocui/member-sessions/2026-06-26-fwjD_zd7lvk'
                        },
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
                          text: '2026-06-26 会员',
                          link: '/trading/experts/xiaocui/member-transcripts/2026-06-26-fwjD_zd7lvk'
                        },
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
                  text: '视野环球财经',
                  link: '/trading/experts/rhino-finance/',
                  collapsed: true,
                  items: [
                    {
                      text: '美股盘后复盘',
                      link: '/trading/experts/rhino-finance/market-reviews/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-27',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-06-27'
                        }
                      ]
                    },
                    {
                      text: '视频文字稿',
                      link: '/trading/experts/rhino-finance/transcripts/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-27',
                          link: '/trading/experts/rhino-finance/transcripts/2026-06-27'
                        }
                      ]
                    },
                    {
                      text: '公司与 ETF 跟踪',
                      link: '/trading/experts/rhino-finance/company-notes/'
                    },
                    {
                      text: '分析框架',
                      link: '/trading/experts/rhino-finance/analysis-framework/'
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
                      link: '/trading/experts/bibabu-zuoshou/technical-notes/',
                      collapsed: true,
                      items: [
                        {
                          text: '情绪周期与仓位',
                          link: '/trading/experts/bibabu-zuoshou/technical-notes/emotion-cycle-and-position'
                        },
                        {
                          text: '题材节奏、分歧与回流',
                          link: '/trading/experts/bibabu-zuoshou/technical-notes/theme-rhythm-divergence-return'
                        },
                        {
                          text: '核心票角色分层',
                          link: '/trading/experts/bibabu-zuoshou/technical-notes/core-stock-roles'
                        }
                      ]
                    },
                    {
                      text: '交易日总结',
                      link: '/trading/experts/bibabu-zuoshou/trading-days/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-28 直播回放',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-28-BV1CBTu6XEmz'
                        },
                        {
                          text: '2026-06-28',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-28'
                        },
                        {
                          text: '2026-06-25',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-25'
                        },
                        {
                          text: '2026-06-24',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-24'
                        },
                        {
                          text: '2026-06-23',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-23'
                        },
                        {
                          text: '2026-06-22',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-22'
                        },
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
                          text: '2026-06-28 直播回放',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-28-BV1CBTu6XEmz'
                        },
                        {
                          text: '2026-06-28',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-28'
                        },
                        {
                          text: '2026-06-25',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-25'
                        },
                        {
                          text: '2026-06-24',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-24'
                        },
                        {
                          text: '2026-06-23',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-23'
                        },
                        {
                          text: '2026-06-22',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-22'
                        },
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
                              text: '2026-06-22',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/reviews/2026-06-22-BV1HT7F6JEXL'
                            },
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
                              text: '2026-06-22',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/review-transcripts/2026-06-22-BV1HT7F6JEXL'
                            },
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
                            },
                            {
                              text: '第 2 课：核心量价关系',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/02-core-volume-price'
                            },
                            {
                              text: '第 3 课：K 线与支撑压力',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/03-kline-support-resistance'
                            },
                            {
                              text: '第 4 课：复盘及工具应用',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/04-review-tools'
                            },
                            {
                              text: '第 5 课：深度看盘及盘面设置',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/05-watchlist-settings'
                            },
                            {
                              text: '第 6 课：情绪周期体系梳理',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/06-emotion-cycle-system'
                            },
                            {
                              text: '第 7 课：情绪周期体系实战篇',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/07-emotion-cycle-practice'
                            },
                            {
                              text: '第 8 课：强势股择股方法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/08-strong-stock-selection'
                            },
                            {
                              text: '第 9 课：龙头、身位、弹性等定义与个股定位',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/09-stock-role-positioning'
                            },
                            {
                              text: '第 10 课：监管详细讲解及监管套利战法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/10-regulation-arbitrage'
                            },
                            {
                              text: '第 11 课：小周期择时方法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/11-small-cycle-timing'
                            },
                            {
                              text: '第 12 课：集合竞价进阶讲解',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/12-auction-advanced'
                            },
                            {
                              text: '第 13 课：弱转强战法详解',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/13-weak-to-strong'
                            },
                            {
                              text: '第 14 课：埋伏战法详解',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/14-event-ambush'
                            },
                            {
                              text: '第 15 课：弱转强战法补充进阶内容',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/15-weak-to-strong-advanced'
                            },
                            {
                              text: '第 16 课：机构趋势战法，三日止盈法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/16-institutional-trend-three-day-profit'
                            },
                            {
                              text: '第 17 课：分歧回流定义及板块运行节奏',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/17-divergence-return-rhythm'
                            },
                            {
                              text: '旁支专题：老庄趋势战法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/side-laozhuang-trend'
                            },
                            {
                              text: '旁支专题：一字定方向战法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system/side-yizi-direction'
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
                            },
                            {
                              text: '第 2 课：核心量价关系',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/02-core-volume-price'
                            },
                            {
                              text: '第 3 课：K 线与支撑压力',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/03-kline-support-resistance'
                            },
                            {
                              text: '第 4 课：复盘及工具应用',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/04-review-tools'
                            },
                            {
                              text: '第 5 课：深度看盘及盘面设置',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/05-watchlist-settings'
                            },
                            {
                              text: '第 6 课：情绪周期体系梳理',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/06-emotion-cycle-system'
                            },
                            {
                              text: '第 7 课：情绪周期体系实战篇',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/07-emotion-cycle-practice'
                            },
                            {
                              text: '第 8 课：强势股择股方法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/08-strong-stock-selection'
                            },
                            {
                              text: '第 9 课：龙头、身位、弹性等定义与个股定位',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/09-stock-role-positioning'
                            },
                            {
                              text: '第 10 课：监管详细讲解及监管套利战法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/10-regulation-arbitrage'
                            },
                            {
                              text: '第 11 课：小周期择时方法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/11-small-cycle-timing'
                            },
                            {
                              text: '第 12 课：集合竞价进阶讲解',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/12-auction-advanced'
                            },
                            {
                              text: '第 13 课：弱转强战法详解',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/13-weak-to-strong'
                            },
                            {
                              text: '第 14 课：埋伏战法详解',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/14-event-ambush'
                            },
                            {
                              text: '第 15 课：弱转强战法补充进阶内容',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/15-weak-to-strong-advanced'
                            },
                            {
                              text: '第 16 课：机构趋势战法，三日止盈法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/16-institutional-trend-three-day-profit'
                            },
                            {
                              text: '第 17 课：分歧回流定义及板块运行节奏',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/17-divergence-return-rhythm'
                            },
                            {
                              text: '旁支专题：老庄趋势战法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/side-laozhuang-trend'
                            },
                            {
                              text: '旁支专题：一字定方向战法',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/hot-money-system-transcripts/side-yizi-direction'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  text: '袁帅马',
                  link: '/trading/experts/yuanshuaima/',
                  collapsed: true,
                  items: [
                    {
                      text: '日常分析',
                      link: '/trading/experts/yuanshuaima/daily-analysis/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-28 周末留言案例',
                          link: '/trading/experts/yuanshuaima/daily-analysis/2026-06-28-BV1CCTu6JE7V'
                        },
                        {
                          text: '2026-06-26 TCL 科技',
                          link: '/trading/experts/yuanshuaima/daily-analysis/2026-06-26-BV1BP756mEai'
                        },
                        {
                          text: '2026-06-25 中国巨石',
                          link: '/trading/experts/yuanshuaima/daily-analysis/2026-06-25-BV1G57v6aEv2'
                        }
                      ]
                    },
                    {
                      text: '视频文字稿',
                      link: '/trading/experts/yuanshuaima/transcripts/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-06-28 周末留言案例',
                          link: '/trading/experts/yuanshuaima/transcripts/2026-06-28-BV1CCTu6JE7V'
                        },
                        {
                          text: '2026-06-26 TCL 科技',
                          link: '/trading/experts/yuanshuaima/transcripts/2026-06-26-BV1BP756mEai'
                        },
                        {
                          text: '2026-06-25 中国巨石',
                          link: '/trading/experts/yuanshuaima/transcripts/2026-06-25-BV1G57v6aEv2'
                        }
                      ]
                    },
                    {
                      text: '充电会员主题',
                      link: '/trading/experts/yuanshuaima/member-topics/'
                    },
                    {
                      text: '技术点学习',
                      link: '/trading/experts/yuanshuaima/technique-notes/'
                    }
                  ]
                },

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
