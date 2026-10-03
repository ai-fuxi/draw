# 🎨 小小画家乐园（ai-fuxi/draw）

专为 3–8 岁幼儿设计的 **涂色 → 绘画** 网站：在涂色中挖掘绘画潜能，在游戏里培养色彩搭配。

线上地址：**https://ai-fuxi.com/draw/**

## ✨ 功能

| 模块 | 说明 |
| --- | --- |
| 🖍️ 涂色乐园 | 7 张原创线稿（小鱼、小猫、花朵、小屋、蝴蝶、恐龙、西瓜），油漆桶填色 + 画笔 + 橡皮 + 撤销 |
| ✏️ 自由绘画 | 画笔 / 马克笔 / 高光笔 / 橡皮 / 10 种印章，可换画纸颜色，保存进画廊 |
| 🧪 色彩学堂 | 调色实验室（两种颜色混合出新色，可加入调色盘）、12 色色相环、三种小游戏（认色 / 冷暖 / 互补色） |
| 🌱 成长之旅 | 6 个成就徽章与进度，解锁即发星星奖励 |
| 🖼️ 我的画廊 | 本地保存全部作品，支持大图查看 / 下载 PNG / 删除 |
| ⭐ 星星激励 | 保存作品 +1 星，整幅涂完 +3 星，答题正确 +1 星，解锁徽章 +3 星 |

## 🚀 本地运行

纯静态站点，无需构建：

```bash
cd draw
python3 -m http.server 8080
# 打开 http://127.0.0.1:8080/
```

或直接双击打开 `index.html`。

## 📦 目录结构

```
index.html            页面骨架（含 ICP 备案页脚）
css/style.css         样式
js/pages.js           线稿素材与色彩数据
js/sound.js           WebAudio 音效（无需音频文件）
js/app.js             全部交互逻辑
.github/workflows/    自动部署工作流
preview/              首页展示截图（不入库）
```

## 🌍 部署

与 edu-agent 相同模式：push 到 `main` 分支后，GitHub Actions 通过 SSH+rsync 把站点同步到腾讯云 nginx 站点根 `/var/www/html/draw/`，访问 `https://ai-fuxi.com/draw/`。

- 部署私钥存放在仓库 Actions Secret：`DEPLOY_KEY`
- 服务器：`62.234.141.185`（ubuntu），nginx `root /var/www/html`
- 域名服务器配置默认把未匹配路径落到 `root`，新建目录即自动生效

## 🪪 ICP 备案

页脚已加入备案号 **黔ICP备2023013418号**，链接至工信部备案查询系统（https://beian.miit.gov.cn/）。