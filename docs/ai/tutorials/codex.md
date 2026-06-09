# Codex 安装使用

Codex 是 OpenAI 的编程智能体，可以读取项目文件、修改代码、运行命令和测试。本教程以 macOS 和命令行为主。

> [!IMPORTANT]
> 截至 2026 年 6 月 9 日，OpenAI 官方帮助中心说明 Codex 可用于 Free、Go、Plus、Pro、Business、Edu 和 Enterprise 计划，额度因计划而异。你可以先使用免费账号体验，不必为了安装 Codex 立即付费。

## 一、准备工作

安装前需要：

- 一个 ChatGPT 账号；
- macOS、Windows 或 Linux；
- 使用 CLI 时，需要安装 Node.js 和 npm；
- 一个准备交给 Codex 操作的项目目录。

可以在终端检查 Node.js：

```bash
node -v
npm -v
```

如果命令不存在，请先从 [Node.js 官网](https://nodejs.org/) 安装当前 LTS 版本。

## 二、安装 Codex CLI

### 第 1 步：执行安装命令

打开“终端”，运行：

```bash
npm install -g @openai/codex
```

安装完成后检查版本：

```bash
codex --version
```

![Codex CLI 安装命令示意图](/images/codex/install-cli.svg)

### 第 2 步：进入项目并启动

先进入项目目录，再启动 Codex：

```bash
cd ~/Documents/你的项目目录
codex
```

Codex 会把当前目录作为工作区，因此启动前要确认路径正确。

### 第 3 步：登录 ChatGPT

首次启动时选择使用 ChatGPT 账号登录，浏览器会打开授权页面。完成登录后回到终端即可。

![Codex 登录方式示意图](/images/codex/login.svg)

如果以前使用 API Key 登录，希望改用 ChatGPT 计划，可运行：

```bash
codex logout
codex
```

然后重新选择 ChatGPT 登录。

## 三、第一次使用

进入一个 Git 项目后，可以先让 Codex 只做检查：

```text
请阅读这个项目，告诉我它使用了什么技术栈，以及如何启动。先不要修改文件。
```

确认 Codex 理解项目后，再给出小而明确的任务：

```text
请修复首页标题的错别字，保持现有样式不变，修改后运行相关测试。
```

建议遵循以下顺序：

1. 先让 Codex 阅读和解释项目；
2. 明确允许修改的范围；
3. 要求修改后运行测试或构建；
4. 查看 Git diff，确认无误后再提交。

常用提示词：

```text
先分析原因，不要修改文件。
```

```text
只修改与这个问题直接相关的文件。
```

```text
完成后运行测试，并总结修改内容。
```

## 四、使用 Codex App

不想使用命令行时，可以安装 Codex App。App 更适合同时管理多个项目和任务。

1. 前往 [Codex 官方页面](https://openai.com/codex/)；
2. 下载适合系统的版本；
3. 安装并使用 ChatGPT 账号登录；
4. 添加本地项目文件夹；
5. 在新任务中描述需求。

只从 OpenAI 官方页面下载安装包，不要使用来源不明的安装文件。

## 五、免费额度与付费计划

免费账号目前可以使用 Codex，但额度较少。经常进行大型项目修改、长时间运行任务或并行工作时，可以再考虑 Plus 或 Pro。

计划、额度和价格会变化，请以以下页面为准：

- [OpenAI：使用 ChatGPT 计划访问 Codex](https://help.openai.com/en/articles/11369540)
- [ChatGPT 价格页面](https://chatgpt.com/pricing)

## 六、国内用户的美区 Apple 礼品卡方案（可选）

如果你已经有**自己长期使用的美区 Apple 账号**，并决定通过 iPhone 或 iPad 内购升级 ChatGPT，可使用美区 Apple Gift Card 为账户充值。

一种第三方购买渠道是 [Pockyt Shop](https://shop.pockyt.io/pc/home)。该网站并非 OpenAI 或 Apple 官方渠道，是否可用、支持的支付方式、价格和规则都可能变化。

![美区 Apple 礼品卡订阅流程示意图](/images/codex/apple-gift-card-flow.svg)

### 第 1 步：确认账号地区

打开 App Store，确认登录的是美国区 Apple 账号。礼品卡必须与账号地区一致，美区礼品卡通常不能兑换到中国区账号。

不要临时频繁切换主账号地区。切换地区可能受现有余额、订阅和家庭共享状态影响。

### 第 2 步：购买美区礼品卡

1. 打开 [Pockyt Shop](https://shop.pockyt.io/pc/home)；
2. 找到美国区 Apple Gift Card；
3. 核对国家或地区、美元面额、最终人民币价格和手续费；
4. 按网站当前支持的方式付款，例如页面确实提供支付宝时再选择支付宝；
5. 收到卡密后妥善保存，不要发给他人。

> [!WARNING]
> 下单属于第三方交易。购买前检查网站域名、商户说明、退款规则和卡密交付方式。不要购买明显低于正常汇率的卡密，也不要向陌生人提供 Apple 账号密码、短信验证码或 ChatGPT 登录信息。

### 第 3 步：兑换到 Apple 账号

在 iPhone 或 iPad 中：

1. 打开 App Store；
2. 点击右上角头像；
3. 选择“兑换充值卡或代码”；
4. 手动输入卡密；
5. 确认美元余额已经到账。

### 第 4 步：在 ChatGPT App 中升级

1. 从美区 App Store 下载官方 ChatGPT App；
2. 登录你自己的 ChatGPT 账号；
3. 打开设置中的升级入口；
4. 核对计划名称、价格、税费和续订日期；
5. 使用 Apple 账户余额完成订阅。

Apple 账号和 ChatGPT 账号是两个不同账号。最终获得会员的是付款时登录的 ChatGPT 账号。

### 第 5 步：检查自动续订

打开 iPhone 的“设置 → Apple 账号 → 订阅”，查看续订日期。若不希望自动续费，应在下次扣款前取消订阅；取消后通常仍可使用到当前计费周期结束。

### 没有美区 Apple 账号时

如果没有美区 Apple 账号，也可以自行了解 [GetGPT](https://getgpt.pro/) 提供的购买服务，并根据网站当前页面选择适合的方案。

> [!WARNING]
> GetGPT 是第三方网站，并非 OpenAI 或 Apple 官方渠道。下单前请确认交付的是会员充值、代充服务还是独立账号，并仔细阅读价格、有效期、退款和售后规则。优先选择充值到自己 ChatGPT 账号的方案，不要购买或长期使用来源不明的共享账号，也不要向第三方提供账号密码、短信验证码、邮箱验证码或其他敏感信息。第三方服务的可用性和规则可能随时变化，相关风险需自行判断。

## 七、常见问题

### `codex: command not found`

关闭并重新打开终端后再试。也可以检查 npm 的全局安装路径：

```bash
npm config get prefix
```

### Codex 无法登录

- 确认浏览器登录的是正确 ChatGPT 账号；
- 退出后重新运行 `codex logout` 和 `codex`；
- 检查网络、系统时间和浏览器是否阻止跳转；
- 工作或学校账号可能受管理员策略限制。

### Codex 修改范围太大

先停止任务，再明确限制：

```text
只修改指定文件。不要重构其他代码，也不要删除任何文件。
```

使用前最好确保项目已经由 Git 管理，并保留重要文件的备份。

## 参考资料

- [OpenAI Codex](https://openai.com/codex/)
- [OpenAI：使用 ChatGPT 计划访问 Codex](https://help.openai.com/en/articles/11369540)
- [Node.js](https://nodejs.org/)

本文核对日期：2026 年 6 月 9 日。
