# Ticker 与标的核名规则

## 核名范围

全部进入“本期全部标的提及表”：

- 美股公司 ticker：如 MSFT、GOOG、GOOGL、NVDA、TSLA、PLTR、AMD。
- ETF：如 IGV、SOXX、SMH、QQQ、SPY、IWM、DIA、XLK。
- 指数或波动率：如 Nasdaq、S&P 500、Dow、Russell 2000、VIX。
- 利率、美元、黄金、原油、比特币等若影响市场判断，也作为资产记录。

## 证据优先级

1. 视频画面中清晰可见的 ticker、名称或图表。
2. 标题、标签、简介、章节。
3. YouTube 字幕或创作者字幕。
4. 同段上下文、重复提及和美股常见 ticker。
5. 外部行情或公司/ETF 官方页面。

## 记录格式

```markdown
| Ticker/名称 | 类型 | 标准名称 | 出现时间 | Rhino 说法 | 核验状态 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
```

类型建议使用：`股票`、`ETF`、`指数`、`宏观资产`、`待核`。

## 常见映射

- `MSFT`：Microsoft Corporation，股票。
- `GOOG` / `GOOGL`：Alphabet Inc.，股票；需保留视频实际说法。
- `NVDA`：NVIDIA Corporation，股票。
- `TSLA`：Tesla, Inc.，股票。
- `PLTR`：Palantir Technologies Inc.，股票。
- `IGV`：iShares Expanded Tech-Software Sector ETF，ETF。
- `SOXX`：iShares Semiconductor ETF，ETF。
- `SMH`：VanEck Semiconductor ETF，ETF。
- `SPY`：SPDR S&P 500 ETF Trust，ETF。
- `QQQ`：Invesco QQQ Trust，ETF。
- `IWM`：iShares Russell 2000 ETF，ETF。

## 准则

- 不确定时写“疑似”或“待核”，不要硬猜。
- 区分 ETF、指数和公司，不把 ETF 表现直接等同于单家公司基本面。
- 同一公司不同 share class 按视频实际说法记录，例如 GOOG 与 GOOGL 不擅自替换。
- 外部行情信息只用于核名和事实背景，不得扩展为主播未说过的买卖建议。
- 标题和标签中的 ticker 也必须进入表格，即使正文只一带而过。
