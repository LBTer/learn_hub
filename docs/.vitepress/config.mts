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
          {
            text: '疑问精研',
            items: [
              { text: '板块首页', link: '/trading/questions/' },
              {
                text: 'CCI 指标科普',
                link: '/trading/questions/2026-07-08-cci-indicator'
              },
              {
                text: '流动性与波动',
                link: '/trading/questions/2026-07-03-es-liquidity-volume-volatility'
              },
              {
                text: 'SK 海力士 ADR 套利',
                link: '/trading/questions/2026-07-14-sk-hynix-adr-arbitrage'
              },
              {
                text: '美元流动性三个水桶',
                link: '/trading/questions/2026-07-19-dollar-liquidity'
              }
            ]
          },
          { text: '流派研究', link: '/trading/schools/' },
          { text: '高手思路', link: '/trading/experts/' },
          {
            text: '视频分析',
            items: [
              { text: '板块首页', link: '/trading/video-analysis/' },
              {
                text: '分析总结',
                link: '/trading/video-analysis/reviews/',
                items: [
                  {
                    text: '2026-06-26 小资金如何做大',
                    link: '/trading/video-analysis/reviews/2026-06-26-BV1E8jR6FEtT'
                  },
                  {
                    text: '2025-07-26 以交易为生到底有多难',
                    link: '/trading/video-analysis/reviews/2025-07-26-BV1U18tznEao'
                  }
                ]
              },
              {
                text: '视频文字稿',
                link: '/trading/video-analysis/transcripts/',
                items: [
                  {
                    text: '2026-06-26 小资金如何做大',
                    link: '/trading/video-analysis/transcripts/2026-06-26-BV1E8jR6FEtT'
                  },
                  {
                    text: '2025-07-26 以交易为生到底有多难',
                    link: '/trading/video-analysis/transcripts/2025-07-26-BV1U18tznEao'
                  }
                ]
              }
            ]
          },
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
          {
            text: '数字K哥',
            items: [
              { text: '人物首页', link: '/trading/experts/shuzi-kge/' },
              {
                text: '日常分析',
                link: '/trading/experts/shuzi-kge/daily-analysis/'
              },
              {
                text: '视频文字稿',
                link: '/trading/experts/shuzi-kge/transcripts/'
              },
              {
                text: '技术点学习',
                link: '/trading/experts/shuzi-kge/technical-notes/'
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
              text: '疑问精研',
              link: '/trading/questions/',
              collapsed: true,
              items: [
                {
                  text: 'CCI 指标科普',
                  link: '/trading/questions/2026-07-08-cci-indicator'
                },
                {
                  text: '流动性与波动',
                  link: '/trading/questions/2026-07-03-es-liquidity-volume-volatility'
                },
                {
                  text: 'SK 海力士 ADR 套利',
                  link: '/trading/questions/2026-07-14-sk-hynix-adr-arbitrage'
                },
                {
                  text: '美元流动性三个水桶',
                  link: '/trading/questions/2026-07-19-dollar-liquidity'
                }
              ]
            },
            {
              text: '流派研究',
              link: '/trading/schools/',
              collapsed: true,
              items: []
            },
            {
              text: '视频分析',
              link: '/trading/video-analysis/',
              collapsed: true,
              items: [
                {
                  text: '分析总结',
                  link: '/trading/video-analysis/reviews/',
                  collapsed: true,
                  items: [
                    {
                      text: '2026-06-26 小资金如何做大',
                      link: '/trading/video-analysis/reviews/2026-06-26-BV1E8jR6FEtT'
                    },
                    {
                      text: '2025-07-26 以交易为生到底有多难',
                      link: '/trading/video-analysis/reviews/2025-07-26-BV1U18tznEao'
                    }
                  ]
                },
                {
                  text: '视频文字稿',
                  link: '/trading/video-analysis/transcripts/',
                  collapsed: true,
                  items: [
                    {
                      text: '2026-06-26 小资金如何做大',
                      link: '/trading/video-analysis/transcripts/2026-06-26-BV1E8jR6FEtT'
                    },
                    {
                      text: '2025-07-26 以交易为生到底有多难',
                      link: '/trading/video-analysis/transcripts/2025-07-26-BV1U18tznEao'
                    }
                  ]
                }
              ]
            },
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
                      text: '2026-07-17',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-17'
                        },
                        {
                          text: '2026-07-16',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-16'
                        },
                        {
                          text: '2026-07-15',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-15'
                        },
                        {
                          text: '2026-07-14',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-14-2O4VsfkiPNk'
                        },
                        {
                          text: '2026-07-13',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-13-OWNeuR2Rskc'
                        },
                        {
                          text: '2026-07-10',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-10'
                        },
                        {
                          text: '2026-07-09',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-09'
                        },
                        {
                          text: '2026-07-08',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-08'
                        },
                        {
                          text: '2026-07-07',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-07'
                        },
                        {
                          text: '2026-07-06',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-06'
                        },
                        {
                          text: '2026-07-02',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-02'
                        },
                        {
                          text: '2026-07-01',
                          link: '/trading/experts/xiaocui/trading-days/2026-07-01'
                        },
                        {
                          text: '2026-06-30',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-30'
                        },
                        {
                          text: '2026-06-29',
                          link: '/trading/experts/xiaocui/trading-days/2026-06-29-wkK_tR_Dzw4'
                        },
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
                      text: '2026-07-17',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-17'
                        },
                        {
                          text: '2026-07-16',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-16'
                        },
                        {
                          text: '2026-07-15',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-15'
                        },
                        {
                          text: '2026-07-14',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-14-2O4VsfkiPNk'
                        },
                        {
                          text: '2026-07-13',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-13-OWNeuR2Rskc'
                        },
                        {
                          text: '2026-07-10',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-10'
                        },
                        {
                          text: '2026-07-09',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-09'
                        },
                        {
                          text: '2026-07-08',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-08'
                        },
                        {
                          text: '2026-07-07',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-07'
                        },
                        {
                          text: '2026-07-06',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-06'
                        },
                        {
                          text: '2026-07-02',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-02'
                        },
                        {
                          text: '2026-07-01',
                          link: '/trading/experts/xiaocui/transcripts/2026-07-01'
                        },
                        {
                          text: '2026-06-30',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-30'
                        },
                        {
                          text: '2026-06-29',
                          link: '/trading/experts/xiaocui/transcripts/2026-06-29-wkK_tR_Dzw4'
                        },
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
                          text: '2026-07-18 会员',
                          link: '/trading/experts/xiaocui/member-sessions/2026-07-18-rGDmDptih6k'
                        },
                        {
                          text: '2026-07-11 会员',
                          link: '/trading/experts/xiaocui/member-sessions/2026-07-11-6an5yGmoOf4'
                        },
                        {
                          text: '2026-07-03 会员',
                          link: '/trading/experts/xiaocui/member-sessions/2026-07-03-kRnc4LpKh9M'
                        },
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
                          text: '2026-07-18 会员',
                          link: '/trading/experts/xiaocui/member-transcripts/2026-07-18-rGDmDptih6k'
                        },
                        {
                          text: '2026-07-11 会员',
                          link: '/trading/experts/xiaocui/member-transcripts/2026-07-11-6an5yGmoOf4'
                        },
                        {
                          text: '2026-07-03 会员',
                          link: '/trading/experts/xiaocui/member-transcripts/2026-07-03-kRnc4LpKh9M'
                        },
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
                          text: '2026-07-16',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-16'
                        },
                        {
                          text: '2026-07-15',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-15'
                        },
                        {
                          text: '2026-07-13',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-13'
                        },
                        {
                          text: '2026-07-10',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-10'
                        },
                        {
                          text: '2026-07-09',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-09'
                        },
                        {
                          text: '2026-07-08',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-08'
                        },
                        {
                          text: '2026-07-07',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-07'
                        },
                        {
                          text: '2026-07-03',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-03'
                        },
                        {
                          text: '2026-07-02',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-02'
                        },
                        {
                          text: '2026-07-01',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-07-01'
                        },
                        {
                          text: '2026-06-30',
                          link: '/trading/experts/rhino-finance/market-reviews/2026-06-30'
                        },
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
                          text: '2026-07-16',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-16'
                        },
                        {
                          text: '2026-07-15',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-15'
                        },
                        {
                          text: '2026-07-13',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-13'
                        },
                        {
                          text: '2026-07-10',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-10'
                        },
                        {
                          text: '2026-07-09',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-09'
                        },
                        {
                          text: '2026-07-08',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-08'
                        },
                        {
                          text: '2026-07-07',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-07'
                        },
                        {
                          text: '2026-07-03',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-03'
                        },
                        {
                          text: '2026-07-02',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-02'
                        },
                        {
                          text: '2026-07-01',
                          link: '/trading/experts/rhino-finance/transcripts/2026-07-01'
                        },
                        {
                          text: '2026-06-30',
                          link: '/trading/experts/rhino-finance/transcripts/2026-06-30'
                        },
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
                          text: '2026-07-20',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-20'
                        },
                        {
                          text: '2026-07-19',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-19'
                        },
                        {
                          text: '2026-07-16',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-16'
                        },
                        {
                          text: '2026-07-15',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-15'
                        },
                        {
                          text: '2026-07-14',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-14'
                        },
                        {
                          text: '2026-07-13',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-13'
                        },
                        {
                          text: '2026-07-12',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-12'
                        },
                        {
                          text: '2026-07-09',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-09'
                        },
                        {
                          text: '2026-07-08',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-08'
                        },
                        {
                          text: '2026-07-07',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-07'
                        },
                        {
                          text: '2026-07-06',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-06'
                        },
                        {
                          text: '2026-07-05',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-05'
                        },
                        {
                          text: '2026-07-02',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-02'
                        },
                        {
                          text: '2026-07-01',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-07-01'
                        },
                        {
                          text: '2026-06-30',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-30'
                        },
                        {
                          text: '2026-06-29',
                          link: '/trading/experts/bibabu-zuoshou/trading-days/2026-06-29'
                        },
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
                          text: '2026-07-20',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-20'
                        },
                        {
                          text: '2026-07-19',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-19'
                        },
                        {
                          text: '2026-07-16',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-16'
                        },
                        {
                          text: '2026-07-15',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-15'
                        },
                        {
                          text: '2026-07-14',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-14'
                        },
                        {
                          text: '2026-07-13',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-13'
                        },
                        {
                          text: '2026-07-12',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-12'
                        },
                        {
                          text: '2026-07-09',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-09'
                        },
                        {
                          text: '2026-07-08',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-08'
                        },
                        {
                          text: '2026-07-07',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-07'
                        },
                        {
                          text: '2026-07-06',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-06'
                        },
                        {
                          text: '2026-07-05',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-05'
                        },
                        {
                          text: '2026-07-02',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-02'
                        },
                        {
                          text: '2026-07-01',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-07-01'
                        },
                        {
                          text: '2026-06-30',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-30'
                        },
                        {
                          text: '2026-06-29',
                          link: '/trading/experts/bibabu-zuoshou/transcripts/2026-06-29'
                        },
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
                              text: '2026-07-19',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/reviews/2026-07-19-BV1f7Kr6YEjr'
                            },
                            {
                              text: '2026-07-05',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/reviews/2026-07-05-BV13mTy6eEEu'
                            },
                            {
                              text: '2026-06-22',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/reviews/2026-06-22-BV1HT7F6JEXL'
                            },
                            {
                              text: '2026-06-16',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/reviews/2026-06-16-BV1StjG68ExA'
                            },
                            {
                              text: '2026-06-14',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/reviews/2026-06-14-BV1r9JA6aENR'
                            }
                          ]
                        },
                        {
                          text: '充电会员复盘文字稿',
                          link: '/trading/experts/bibabu-zuoshou/member-topics/review-transcripts/',
                          collapsed: true,
                          items: [
                            {
                              text: '2026-07-19',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/review-transcripts/2026-07-19-BV1f7Kr6YEjr'
                            },
                            {
                              text: '2026-07-05',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/review-transcripts/2026-07-05-BV13mTy6eEEu'
                            },
                            {
                              text: '2026-06-22',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/review-transcripts/2026-06-22-BV1HT7F6JEXL'
                            },
                            {
                              text: '2026-06-16',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/review-transcripts/2026-06-16-BV1StjG68ExA'
                            },
                            {
                              text: '2026-06-14',
                              link: '/trading/experts/bibabu-zuoshou/member-topics/review-transcripts/2026-06-14-BV1r9JA6aENR'
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
                        text: '2026-07-20 哈药股份',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-20-BV15ZK26rEQz'
                      },
                      {
                        text: '2026-07-19 主力操盘识别',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-19-BV1F7Kr6eE7H'
                      },
                      {
                        text: '2026-07-18 长江电力等案例',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-18-BV11BKA6vETS'
                      },
                      {
                        text: '2026-07-17 京东方A等',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-17-BV1TTKn6DEuh'
                      },
                      {
                        text: '2026-07-16 东山精密等案例',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-16-BV1DyK36eEeY'
                      },
                      {
                        text: '2026-07-15 等待调整到位',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-15-BV1GJNB6kECa'
                      },
                      {
                        text: '2026-07-14 市场未真正见底',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-14-BV1wANb6aEby'
                      },
                      {
                        text: '2026-07-13 破位大跌抄底',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-13-BV11yNy6UEZ6'
                      },
                      {
                        text: '2026-07-12 案例讲解',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-12-BV1RCNu6aE8o'
                      },
                      {
                        text: '2026-07-10 中科曙光',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-10-BV1NHNn67E4u'
                      },
                      {
                        text: '2026-07-09 浪潮信息',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-09-BV1fqME6uEhk'
                      },
                      {
                        text: '2026-07-08 案例讲解',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-08-BV18yMG6gEqB'
                      },
                      {
                        text: '2026-07-07 露笑科技',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-07-BV17oMb6KEX1'
                      },
                      {
                        text: '2026-07-06 紫光股份',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-06-BV1FWTQ6PEfq'
                      },
                      {
                        text: '2026-07-05 周末留言案例',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-05-BV1KFT16xEsJ'
                      },
                      {
                        text: '2026-07-03 埃斯顿',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-03-BV1zPTt6fEMW'
                      },
                      {
                        text: '2026-07-02 永太科技',
                        link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-02-BV1rfTL6YEpw'
                      },
                        {
                          text: '2026-07-01 天娱数科',
                          link: '/trading/experts/yuanshuaima/daily-analysis/2026-07-01-BV1PSTi6cErk'
                        },
                        {
                          text: '2026-06-30 雅克科技',
                          link: '/trading/experts/yuanshuaima/daily-analysis/2026-06-30-BV1jETF61EGJ'
                        },
                        {
                          text: '2026-06-29 凯盛科技',
                          link: '/trading/experts/yuanshuaima/daily-analysis/2026-06-29-BV1C8KQ6PEAo'
                        },
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
                        text: '2026-07-20 哈药股份',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-20-BV15ZK26rEQz'
                      },
                      {
                        text: '2026-07-19 主力操盘识别',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-19-BV1F7Kr6eE7H'
                      },
                      {
                        text: '2026-07-18 长江电力等案例',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-18-BV11BKA6vETS'
                      },
                      {
                        text: '2026-07-17 京东方A等',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-17-BV1TTKn6DEuh'
                      },
                      {
                        text: '2026-07-16 东山精密等案例',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-16-BV1DyK36eEeY'
                      },
                      {
                        text: '2026-07-15 等待调整到位',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-15-BV1GJNB6kECa'
                      },
                      {
                        text: '2026-07-14 市场未真正见底',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-14-BV1wANb6aEby'
                      },
                      {
                        text: '2026-07-13 破位大跌抄底',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-13-BV11yNy6UEZ6'
                      },
                      {
                        text: '2026-07-12 案例讲解',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-12-BV1RCNu6aE8o'
                      },
                      {
                        text: '2026-07-10 中科曙光',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-10-BV1NHNn67E4u'
                      },
                      {
                        text: '2026-07-09 浪潮信息',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-09-BV1fqME6uEhk'
                      },
                      {
                        text: '2026-07-08 案例讲解',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-08-BV18yMG6gEqB'
                      },
                      {
                        text: '2026-07-07 露笑科技',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-07-BV17oMb6KEX1'
                      },
                      {
                        text: '2026-07-06 紫光股份',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-06-BV1FWTQ6PEfq'
                      },
                      {
                        text: '2026-07-05 周末留言案例',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-05-BV1KFT16xEsJ'
                      },
                      {
                        text: '2026-07-03 埃斯顿',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-03-BV1zPTt6fEMW'
                      },
                      {
                        text: '2026-07-02 永太科技',
                        link: '/trading/experts/yuanshuaima/transcripts/2026-07-02-BV1rfTL6YEpw'
                      },
                        {
                          text: '2026-07-01 天娱数科',
                          link: '/trading/experts/yuanshuaima/transcripts/2026-07-01-BV1PSTi6cErk'
                        },
                        {
                          text: '2026-06-30 雅克科技',
                          link: '/trading/experts/yuanshuaima/transcripts/2026-06-30-BV1jETF61EGJ'
                        },
                        {
                          text: '2026-06-29 凯盛科技',
                          link: '/trading/experts/yuanshuaima/transcripts/2026-06-29-BV1C8KQ6PEAo'
                        },
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
                {
                  text: '数字K哥',
                  link: '/trading/experts/shuzi-kge/',
                  collapsed: true,
                  items: [
                    {
                      text: '日常分析',
                      link: '/trading/experts/shuzi-kge/daily-analysis/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-07-20 BTC/ETH 转空',
                          link: '/trading/experts/shuzi-kge/daily-analysis/2026-07-20-BV1cPK26UEJk'
                        },
                        {
                          text: '2026-07-17 BTC 关键位',
                          link: '/trading/experts/shuzi-kge/daily-analysis/2026-07-17-BV1BKKH6gErG'
                        },
                        {
                          text: '2026-07-16 ETH/BTC',
                          link: '/trading/experts/shuzi-kge/daily-analysis/2026-07-16-BV1NVK36REMs'
                        },
                        {
                          text: '2026-07-09 BTC/ETH',
                          link: '/trading/experts/shuzi-kge/daily-analysis/2026-07-09-BV1YsM76bEDr'
                        },
                        {
                          text: '2026-07-08 BTC/HYPE',
                          link: '/trading/experts/shuzi-kge/daily-analysis/2026-07-08-BV1ThMi6TERU'
                        },
                        {
                          text: '2026-07-07 BTC 调整',
                          link: '/trading/experts/shuzi-kge/daily-analysis/2026-07-07-BV19BMx6DEXs'
                        }
                      ]
                    },
                    {
                      text: '视频文字稿',
                      link: '/trading/experts/shuzi-kge/transcripts/',
                      collapsed: true,
                      items: [
                        {
                          text: '2026-07-20 BTC/ETH 转空',
                          link: '/trading/experts/shuzi-kge/transcripts/2026-07-20-BV1cPK26UEJk'
                        },
                        {
                          text: '2026-07-17 BTC 关键位',
                          link: '/trading/experts/shuzi-kge/transcripts/2026-07-17-BV1BKKH6gErG'
                        },
                        {
                          text: '2026-07-16 ETH/BTC',
                          link: '/trading/experts/shuzi-kge/transcripts/2026-07-16-BV1NVK36REMs'
                        },
                        {
                          text: '2026-07-09 BTC/ETH',
                          link: '/trading/experts/shuzi-kge/transcripts/2026-07-09-BV1YsM76bEDr'
                        },
                        {
                          text: '2026-07-08 BTC/HYPE',
                          link: '/trading/experts/shuzi-kge/transcripts/2026-07-08-BV1ThMi6TERU'
                        },
                        {
                          text: '2026-07-07 BTC 调整',
                          link: '/trading/experts/shuzi-kge/transcripts/2026-07-07-BV19BMx6DEXs'
                        }
                      ]
                    },
                    {
                      text: '技术点学习',
                      link: '/trading/experts/shuzi-kge/technical-notes/'
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
