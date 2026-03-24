---
title: ' Scalable Diffusion Models with Transformers精读'
date: 2026-03-24
permalink: /posts/2026/03/scalable-diffusion-models-with-transformers/
tags:
 - Diffusion Model
 - Transformer
---

相较于LDM改动的只有两点：
1. 输入怎么传给Transformer: 把latent切成patch，然后拼成序列，**patch size**越小，token 数越多，Gflops 也会明显上升（patch size影响巨大）

结构图如下：
![](/images/posts/image-2026-03-24-15-58-52-762Z.png)

2.条件怎么注入？
这里的条件都是比较简单的类别标签、时间t等，而不是长文本标签
作者试了 4 种方式：
1. in-context conditioning：把条件 token 直接拼进输入序列
2. cross-attention：像标准 Transformer 一样加一层 cross-attention
3. adaLN：用 adaptive layer norm 从条件里回归出调制参数
4. adaLN-Zero：在 adaLN 基础上再做 identity-friendly 的零初始化，让 block 初始更像恒等映射。

结果是：adaLN-Zero 效果最好，而且计算最省。

如果需要注入文本信息（文生图任务），以z-image为例：
不做cross attention，它采用 Scalable Single-Stream DiT (S3-DiT)，把 text tokens、visual semantic tokens、image VAE tokens 在序列级直接拼接成一个统一输入流，再交给同一个 Transformer 处理，相当于一个self attention，比做cross attention参数更小。
