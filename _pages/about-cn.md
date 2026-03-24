---
permalink: /cn/
title: "关于我"
author_profile: true
lang: cn
---

我是**赵以恒 (Zhao Yiheng)**，目前就读于[南洋理工大学](https://www.ntu.edu.sg/) (NTU)，攻读计算机控制与自动化方向理学硕士。本科毕业于[河海大学](https://www.hhu.edu.cn/)计算机科学与技术专业。我的研究兴趣包括 **AIGC**、**AI 安全**。

目前在Prof Jiang Xudong的指导下进行对多模态大模型、智能体的鲁棒性以及对抗攻击研究。

---

## 📰 最新动态

- **[2025.03]** 🔍 正在寻找 **AIGC / AI 安全** 方向实习机会！
- **[2025]** VLM 对抗攻击论文已投稿 **ACM MM 2026**（CCF-A）。
- **[2025]** 论文被 **Journal of Translational Medicine**（中科院医学2区）录用。

---

## 📝 发表论文

1. **Zhao, Y-H.**, et al. *Scale-Induced Semantic Shift in Visual Prompt Injection Against VLMs and Web Agents.* （投稿至 **ACM MM 2026**，CCF-A）

2. Wang, H-Y., Yuan, C., **Zhao, Y-H.**, et al. (2025). *DHerbKB for CKD: knowledge base of diet and toxic herbal medicines for clinical support of chronic kidney disease.* 已被 **Journal of Translational Medicine**（中科院医学2区）录用。

---

## 📖 最近文章

{% for post in site.posts limit:5 %}
- **[{{ post.date | date: "%Y-%m-%d" }}]** [{{ post.title }}]({{ post.url }})
{% endfor %}

{% if site.posts.size == 0 %}
_即将更新，敬请期待！🚧_
{% endif %}
