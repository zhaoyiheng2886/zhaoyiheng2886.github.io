---
permalink: /
title: "About Me"
author_profile: true
lang: en
redirect_from: 
  - /about/
  - /about.html
---

Hi! I'm **Zhao Yiheng**, a Master's student at [Nanyang Technological University](https://www.ntu.edu.sg/) (NTU), Singapore, majoring in Computer Control and Automation. I received my B.Eng. in Computer Science and Technology from [Hohai University](https://www.hhu.edu.cn/), Nanjing, China. My research interests include **AIGC**, **AI Security**.

Currently, I am working on robustness and adversarial attacks against multimodal large models and agents under the supervision of Prof. Jiang Xudong.

---

## 📰 News

- **[Mar. 2025]** 🔍 Actively looking for **AIGC / AI Security** internship opportunities!
- **[2025]** Paper on VLM adversarial attacks submitted to **ACM MM 2026** (CCF-A).
- **[2025]** Paper accepted by **Journal of Translational Medicine**.

---

## 📝 Publications

1. **Zhao, Y-H.**, et al. *Scale-Induced Semantic Shift in Visual Prompt Injection Against VLMs and Web Agents.* (Submitted to **ACM MM 2026**, CCF-A).

2. Wang, H-Y., Yuan, C., **Zhao, Y-H.**, et al. (2025). *DHerbKB for CKD: knowledge base of diet and toxic herbal medicines for clinical support of chronic kidney disease.* Accepted by **Journal of Translational Medicine**.

---

## 📖 Recent Blog Posts

{% for post in site.posts limit:5 %}
- **[{{ post.date | date: "%Y-%m-%d" }}]** [{{ post.title }}]({{ post.url }})
{% endfor %}

{% if site.posts.size == 0 %}
_Coming soon — stay tuned! 🚧_
{% endif %}
