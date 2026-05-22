/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavItem, ServiceAsset, MemoPost } from './types';

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'nav-1',
    title: 'LLM/VLM 训练环境一键配置',
    description: 'PyTorch + CUDA 12.4 + HuggingFace 高速国内镜像源加速环境搭建指南。',
    linkUrl: '${baseUrl}docs/',
    category: '环境配置',
    isInternalOnly: false,
    contentMarkdown: `### 🚀 LLM/VLM 环境快速配置指南

为了避免软件实验室网络限速和国外源访问慢的问题，请按照以下步骤搭建 CUDA 12.4 深度学习开发环境：

#### 1. Miniconda 创建专有虚拟环境
\`\`\`bash
conda create -n lab-llm python=3.10 -y
conda activate lab-llm
\`\`\`

#### 2. 安装 PyTorch 官方发布版 (整合 CUDA 12.4)
\`\`\`bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
\`\`\`

#### 3. 配置 HuggingFace 与 ModelScope 镜像加速 (极速拉取模型)
在 \`~/.bashrc\` 底部添加以下环境变量：
\`\`\`bash
export HF_ENDPOINT="https://hf-mirror.com"
export REPO_URL="http://10.12.8.10:5244" # 局域网数据集主轴
\`\`\`
然后执行 \`source ~/.bashrc\` 使配置生效。

#### 4. 测试验证
\`\`\`python
import torch
print("CUDA Available:", torch.cuda.is_available())
print("Device Count:", torch.cuda.device_count())
\`\`\`

如有任何关于驱动版本不匹配的报错 (如 Driver Version Mismatch), 请联系 A 栋 408 运维值班室安排全局物理卡重启。`
  },
  {
    id: 'nav-2',
    title: '实验室 Docker 镜像打包及私有仓推送规范',
    description: '指导如何快速将本地训练微调模型封装为 Docker 镜像并推送至局域网 Harbor 仓。',
    linkUrl: '${baseUrl}docs/',
    category: '镜像打包',
    isInternalOnly: true,
    contentMarkdown: `### 🐋 实验室私有 Docker 镜像与 Harbor 推送指引

根据实验室算力集群共享原则，为了避免集群被分散的文件系统撑爆，所有训练微调服务必须完成微服务化打包，并统一推送至局域网内部 Harbor 容器仓库。

#### 1. 登录局域网 Harbor 专仓
\`\`\`bash
docker login 10.12.8.2:5000 -u student_lab -p [内部动态密码请进入成员模式获取]
\`\`\`

#### 2. 撰写轻量化 Dockerfile 示例 (基于 PyTorch 运行时)
避免拉取多余套件。推荐使用 \`slim\` 底包：
\`\`\`dockerfile
FROM pytorch/pytorch:2.2.1-cuda12.1-cudnn8-runtime
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple/
COPY . .
ENTRYPOINT ["python", "train_pipeline.py"]
\`\`\`

#### 3. 镜像构建与版本打标
\`\`\`bash
docker build -t 10.12.8.2:5000/models/deepseek-micro:v1.0.0 .
\`\`\`

#### 4. 推送至实验室节点集群
\`\`\`bash
docker push 10.12.8.2:5000/models/deepseek-micro:v1.0.0
\`\`\`

> 📌 **安全注意**: 请勿将带有局域网 API Keys、外部敏感 Token 或未加密数据库连接字符串的源码直接打入 Docker Layer，防止外部泄密。`
  },
  {
    id: 'nav-3',
    title: 'SLURM 算力集群排队预约与公平资源配额办法',
    description: '实验室共享高性能 A100/A800/A6000 算力调配政策，防止单个任务长期侵占公共资源的规范。',
    linkUrl: '${baseUrl}docs/vpn_guide',
    category: '实验规范',
    isInternalOnly: false,
    contentMarkdown: `### 📊 SLURM 算力集群排队预约与使用配额

为保证软件实验室 4 个研究方向、40+ 成员的算力公平使用，公共 GPU 划分了 \`debug\`、\`short\`、\`mid\` 三大调度队列。具体参数对齐规定如下。

| 队列分区 (Partition) | 单次最高时限 (Max Time) | 单卡最大预约卡数 | 算力优先级系数 (Priority) | 主要允许类型 |
| :--- | :--- | :--- | :--- | :--- |
| **debug** | 2 小时 | 1 NVIDIA Card | 1.8 (特急) | 基础编译、梯度收敛快速测试 |
| **short** | 24 小时 | 2 NVIDIA Cards | 1.0 (标准) | 一般科研模型训练、模型评估排队 |
| **mid** | 72 小时 | 8 NVIDIA Cards | 0.5 (中偏低) | 预训练、大规模分布式并行微调 |

#### 典型单卡 SLURM 调度作业提交脚本
编写并保存为 \`submit_job.sh\`:
\`\`\`bash
#!/bin/bash
#SBATCH --job-name=llama_eval
#SBATCH --partition=short
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --mem=32G
#SBATCH --output=%j_output.log

conda activate lab-llm
python run_eval.py --model_path /data/models/llama-3.1-8b/
\`\`\`
然后执行语句递交作业： \`sbatch submit_job.sh\`。

#### ⛔ 处罚条例
1. 严禁避开 SLURM 调度程序通过 Python 直接在物理宿主机后台或裸机中运行进程！一经监测，系统后台将自动执行 \`kill -9\` 重度强杀并清空进程所占内存显存。
2. 作业无心跳、死锁占卡超过 6 小时无运算记录者，值班管理员将人工清退并警告扣除虚拟信用算力分。`
  },
  {
    id: 'nav-4',
    title: '关于本站建设目标 & Tailscale 联调接入流程',
    description: '实验室互联网对公信息展示与零信任隔离机制。通过 Tailscale 完成安全局域网无感通行的核心配置。',
    linkUrl: '#about',
    category: '关于本站',
    isInternalOnly: false,
    contentMarkdown: `### 🌐 本站建设机制 与 Tailscale 精细化安全组网

本站作为**软件工程与大模型实验室的日常门户大本营**，致力于为在校研究生、指导老师及毕业校友提供纯粹、极速的数据交互跳板。

#### 零信任内网访问：为什么需要 Tailscale？
1. **防止端口泄露**: 实验室部署的各类开源看板工具 (如 Memos 轻量备忘、AList 聚合文件等) 大多缺乏工业级安全防火墙保护。暴露于外网易受到暴力破解或已知 0day 渗透。
2. **两路协同**: 本站特为所有站内工具提供了**物理内网/Tailscale 零信任网络**双向出口通道。
   * **物理内网路**: 当你的终端设备物理插线，或在教研室连接实验室专属 Wi-Fi (\`Lab-5G-HighSpeed\`) 时，使用 \`10.12.8.x\` 局域网直接通联。
   * **Tailscale 零信任路**: 当你回宿宿舍、出差海外或在家办公时，终端开启 Tailscale 连接我们的实验室虚拟局域网 \`LabZeroNet\`，直接以统一专属域名无阻秒级跳转，彻底告别配置繁杂的 OpenVPN 或端口硬穿透！

#### 🔑 加入实验室网络操作指引
1. 下载 Tailscale 客户端 (支持 macOS/Windows/Linux/iOS/Android)。
2. 本网站进入**【成员模式】**，点击右上方“密钥展示”提取我们的官方邀请链接和专属一键入网 Token (AuthKey)。
3. 在你的电脑终端执行：

];

export const DEFAULT_SERVICES: ServiceAsset[] = [
  {
    id: 'srv-1',
    name: 'Memos 轻速备忘流',
    description: '实验室闪念、日常、代码 Bug、科研发现的分享平台。',
    icon: 'StickyNote',
    localUrl: 'http://192.168.31.240:5230',
    tailscaleUrl: 'http://100.68.153.123:5230',
    status: 'online'
  },
  {
    id: 'srv-2',
    name: 'AList 文件存储中心',
    description: '服务器的归档软件仓库。目前仅支持内网下载。',
    icon: 'FolderClosed',
    localUrl: 'http://192.168.31.240:5244',
    tailscaleUrl: 'http://100.68.153.123:5244',
    status: 'online'
  },
  // {
  //   id: 'srv-3',
  //   name: 'JupyterHub 算力调试大厅',
  //   description: '支持单点共享登录的多用户 CPU/GPU 混合调试沙箱，提供快速的代码原型构建环境。',
  //   icon: 'Cpu',
  //   localUrl: 'http://10.12.8.20:8000',
  //   tailscaleUrl: 'http://jupyterhub.lab-net.ts.net',
  //   status: 'online'
  // },
  // {
  //   id: 'srv-4',
  //   name: 'Lab Code-Server',
  //   description: '运行在 DGX 超算节点之上的远程浏览器 IDE，支持无需配置的远程一键炼丹。',
  //   icon: 'Code',
  //   localUrl: 'http://10.12.8.15:8080',
  //   tailscaleUrl: 'http://codesrv.lab-net.ts.net',
  //   status: 'maintenance'
  // },
  // {
  //   id: 'srv-5',
  //   name: 'Harbor 镜像中央仓',
  //   description: '托管实验室的所有容器快照，提供专用的物理节点以极速拉取并直接热启动运行。',
  //   icon: 'Layers',
  //   localUrl: 'http://10.12.8.2:5000',
  //   tailscaleUrl: 'http://harbor.lab-net.ts.net',
  //   status: 'online'
  // }
];

export const DEFAULT_MEMOS: MemoPost[] = [
  {
    id: 'memo-1',
    author: '张三峰 (大模型组研二)',
    avatarSeed: 'zhang',
    content: '🎉 成功跑通了 **DeepSeek-R1 蒸馏 Qwen-14B** 的本地分布式推理与 LLaMA-Factory 增量微调！在 DGX 单机双卡 4090 下达到了 **34.5 tokens/sec** 的超强吞吐。所有的量化预打包镜像 \`deepseek-distill-qwen-14b-v1.tar\` 已直接共享到了 AList 文件存储中心根目录下，环境配置方法我已同步维护进本站的【环境配置专版】，大家自取！',
    timestamp: '2026-05-20 08:32',
    tags: ['环境分享', 'Qwen-14B', 'DeepSeek'],
    isPrivate: false
  },
  {
    id: 'memo-2',
    author: '李秋林 (安全方向博一)',
    avatarSeed: 'li',
    content: '⚠️ **【网络安全应急通知】** 兄弟们注意！下午 14:00 - 16:00 之间，请勿在本地宿主或算力端上直接使用 \`admin / admin888\` 等高危险简单弱密码。教务处网络防火墙刚刚对实验室所在网段的 A100/A800 暴露端口进行了网络端口碰撞审计，已有 2 两个节点被判定有安全溢出风险。请务必开启 Tailscale 或在内网配网后修改高强度鉴权凭据！',
    timestamp: '2026-05-19 16:15',
    tags: ['安全提示', '网络排爆'],
    isPrivate: true
  },
  {
    id: 'memo-3',
    author: '王小伟 (科研值班秘书)',
    avatarSeed: 'wang',
    content: '📌 **机房检修周报 (物理检修)** \n主干光纤线路与 A6000 算力组备用电池(UPS)将于 **本周五上午 9:00 - 11:30** 进行耐压测试。此次检修将断开备用宿主机电源。在此期间，请跑长周期的同学务必在 SLURM 作业中加入 \`--checkpoint\` 或设置定期写盘保存，避免因为物理重启造成不可恢复的算法丢包！',
    timestamp: '2026-05-18 10:20',
    tags: ['官方公告', 'UPS断电'],
    isPrivate: false
  },
  {
    id: 'memo-4',
    author: '孙教授 (实验室学术导师)',
    avatarSeed: 'sun',
    content: '🌟 转给各位同学：CVPR 2026 投稿论文第一阶段大修结果已经出炉，恭喜本实验室有两篇一作论文进入 R&R 面试大纲！请做视频理解与三维重建的小组成员，在明晚 (5月21日) 19:30 前往 A401 多功能报告厅开展集中答辩与盲审应对练习，欢迎研一方面的新生也来旁听学习，这对于写好第一篇科学论文极为重要。',
    timestamp: '2026-05-18 09:00',
    tags: ['喜报', '学术指导'],
    isPrivate: false
  },
  {
    id: 'memo-5',
    author: '管理员 (运维总组主任)',
    avatarSeed: 'admin',
    content: '🔓 内部 Tailscale 配网注册使用的一键邀请链接和安全通行密钥 (\`tskey-auth-lab-2026-secure\`) 已经封装到站内的【关于本站】模块中，只有通过上方切换解锁**「成员模式」**才能直接阅读和拉取命令行。新人配网遇到任何 IP 指向冲突，可在 Memos 留言艾特我。',
    timestamp: '2026-05-17 14:02',
    tags: ['新手须知', 'Tailscale通行'],
    isPrivate: true
  }
];
