---
title: 'Back to Basics: Let Denoising Generative Models Denoise精读'
date: 2026-03-25
permalink: /posts/2026/03/back-to-basics-let-denoising-generative-models-denoise/
tags:
 - Diffusion Model
 - Transformer
---

首先了解一下**流形假设**（ In machine
learning, it has long been hypothesized that “(highdimensional) data lie (roughly) on a low-dimensional manifold” ，虽然原始数据看起来处在一个非常高维的空间里，但真实、自然的数据其实只分布在这个高维空间中的一个低维“薄片”上。这个“薄片”就叫 流形。**模型其实是在学这个流形的形状和分布**

由此，JiT这篇文章提出，直接预测干净图像，因为更接近低维流形。在此之前，一共有三种预测对象：
1. 噪声（DDPM做法）
2. velocity（是一个高维张量，所以可以理解为在当前时间步，这个样本沿着生成轨迹该往哪个方向运动）：v=αt​ϵ−σt​x,
3. 干净像素本身（本文做法）

这三种做法虽然看起来一样，但是实际上预测难度不同，如下图所示：

![](/images/posts/image-2026-03-25-08-40-04-008Z.png)

然后文章4.2小节在一层一层探究，到底是什么原因导致了plan pixel Transformer的失败：
1. 是不是loss里的权重分配？（Loss weighting is not sufficient）**结论：有影响，但不关键**
2. sampler或者是噪声强度问题？（Noise-level shift is not sufficient）**结论：更高一些的噪声水平对已经能工作的 x-pred 是有帮助的，但是另外两种救不活，也不关键**
3. 模型太窄了？（Increasing hidden units is not necessary）**结论：不是**
4. 在模型内部主动压缩一下（区分一下，latent是在模型外面先压缩）（Bottleneck can be beneficial）**结论：如果 clean image 本来就在低维流形附近，那么适当瓶颈反而可能帮助模型只保留真正有用的低维结构**

最终文中采取的是**预测干净像素x，但是loss用v来计算**：
![](/images/posts/image-2026-03-25-09-13-11-599Z.png)

JiT 的价值，不在于它立刻击败了其他所有对手，而在于它证明了：很多人以为 pixel diffusion 必须依赖 tokenizer、预训练或复杂专用结构，其实未必。关键可能先是把预测目标选对。

