---
title: 'CS224N-Post Training'
date: 2026-03-30
permalink: /posts/2026/03/cs224n-post-training/
---

这一章主要介绍了SFT跟RLHF，SFT说的很简单，介绍了一下Instruction finetuning，重点了介绍一下RLHF，全称是Reinforcement learning from human preferences，主要分为PPO、DPO和GRPO。

## 一、Instrucution finetuning
1. 为什么需要 SFT
预训练语言模型会做 language modeling，但这不等于会“帮用户做事”。课件给的例子里，用户问“给 6 岁小孩解释登月”，原始 GPT-3 更像是在继续列相似问题，而不是直接回答；所以需要 finetuning 来把“会续写”改成“会响应用户意图”。

2. SFT 到底在做什么
SFT 的核心非常朴素：收集很多 (instruction, output) 对，然后继续微调模型。也就是给模型看“用户怎么问、理想答案怎么写”，让它学会按照这个格式输出。课件把这叫 instruction finetuning，并强调这种训练是跨 many tasks 做的，目标是在 unseen tasks 上也能更好泛化。

3. SFT 学到的不是知识本身，而是“按任务说话”的能力
这点很重要。课件里 Flan-T5 的例子说明，经过 instruction finetuning 后，模型更会识别“这是一个问答任务/推理任务/消歧任务”，更会按要求给出解释、步骤和结论。也就是说，**SFT 很大程度上是在教模型 任务格式、回答风格、指令跟随习惯**。

4. 为什么它有效
课件给了两个关键信号。第一，**数据和模型规模都重要**：Super-NaturalInstructions 有 1.6K+ tasks、3M+ examples，覆盖分类、改写、翻译、QA 等很多任务；第二，**大模型从 instruction tuning 中拿到的增益更大**：Flan-T5 相比原始 T5，在 BIG-bench + MMLU 上有显著提升，而且 model 越大，增益越大。

5. SFT 数据不一定全靠人工硬标
![](/images/posts/image-2026-03-30-03-02-05-639Z.png)
这一部分课件也讲得很实用。Self-Instruct/Alpaca 说明，可以先用一个强模型生成 instruction、input、output，再拿这些数据去微调开源模型；而 LIMA 的结论更激进：高质量样本比纯数量更重要，instruction tuning 不一定非要特别多数据。

6. 为什么后面还要 RLHF / DPO
因为 SFT 有天然上限。课件专门列了几个限制：高质量标准答案贵；很多开放式任务根本没有唯一正确答案；而 language modeling 的 token-level 损失对不同错误一视同仁，但人类偏好不是这样。所以 SFT 虽然能让模型“更会回答”，但还没真正解决“更符合人类偏好”这件事，这就是后面 RLHF 和 DPO 出场的原因。

## 二、RLHF
| 维度 | PPO | DPO | GRPO |
|---|---|---|---|
| 全称 | Proximal Policy Optimization | Direct Preference Optimization | Group Relative Policy Optimization |
| 方法类型 | 强化学习（policy optimization） | 直接偏好优化，偏监督学习 | 强化学习，PPO 变体 |
| 是否显式做 RL | 是 | 否 | 是 |
| 核心思想 | 用 reward model 给分，再用 PPO 稳定地更新策略 | 直接用 chosen / rejected 偏好对训练模型，让 preferred answer 概率更高 | 对同一 prompt 采样**一组回答**，用组内相对 reward 做优势估计，省掉 critic |
| 是否需要 reward model | 通常需要 | 不需要单独显式训练 reward model | 通常需要可打分的 reward 函数/奖励信号 |
| 是否需要 value / critic model | 通常需要 | 不需要 | 通常不需要单独 critic |
| 训练数据形式 | prompt + 采样回答 + reward / preference | prompt + chosen/rejected response pair | prompt + 一组 sampled responses + reward |
| 优化目标 | 最大化 reward，同时加 KL 约束不偏离 reference model 太远 | 直接优化 winning response 相对 losing response 的概率优势 | 类 PPO 目标，但 advantage 来自组内相对比较 |
| 是否需要在线采样 rollout | 需要 | 不需要 | 需要 |
| 计算/工程复杂度 | 高 | 低 | 中等，通常低于 PPO |
| 训练稳定性 | 相对更难调，超参数敏感 | 通常更稳定 | 一般比 PPO 简洁，但仍有 RL 不稳定性 |
| 主要优点 | 通用、理论和实践都成熟，适合真正的 RLHF | 简单、稳定、便宜，开源对齐里很常见 | 去掉 critic，更省资源，适合 reasoning / verifier reward 场景 |
| 主要缺点 | 训练复杂、成本高、容易不稳定 | 更依赖静态偏好对数据，不擅长真正在线探索 | 组内相对奖励有时信息不足，仍需在线采样和奖励设计 |
| 更适合的场景 | 经典 RLHF、需要在线优化、长程决策 | 离线偏好对齐、SFT 后继续 alignment | 数学/代码/推理等可验证奖励场景，reasoning post-training |

