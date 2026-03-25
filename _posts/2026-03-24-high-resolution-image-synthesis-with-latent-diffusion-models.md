---
title: 'High-Resolution Image Synthesis with Latent Diffusion Models精读'
date: 2026-03-24
permalink: /posts/2026/03/high-resolution-image-synthesis-with-latent-diffusion-models/
---

核心观点很简单，
1.引入了latent空间：DDPM在像素级别加噪声代价太大，我们先压缩到一个latent空间，再加噪。
2.给Unet引入了cross attention

但是方法值得思考：VAE怎么训练，为什么，如何压缩的又小又完整
## encoder和decoder怎么做：
下面的figure 2展示了两种压缩方法：
1.perceptual compression：压缩人眼看不见的高频细节
2.semantic compression：学习图像里真正重要的语义和组合规律

latent主要压缩的就是perception的部分。（在训练的loss里加入了perception部分）

![](/images/posts/image-2026-03-24-14-07-09-380Z.png)

## 为什么引入cross attention：
首先，在 cross-attention 成为主流之前，条件信息——尤其是文本——通常怎么喂给 diffusion 模型？

1.第一条是 把条件压成一个全局向量，然后塞进 U-Net 的条件通道里（加法、拼接、条件归一化）
2.第二条是 不把文本深度注入 denoiser，而是在采样时用外部模型来“推着走”

**cross attention怎么做(如Figure 3所示)：
先把条件输入y编成一串表示，再在 U-Net 的中间特征上用 cross-attention，让图像 latent 特征作为 query，条件表示作为 key/value。**

![](/images/posts/image-2026-03-24-14-07-36-772Z.png)