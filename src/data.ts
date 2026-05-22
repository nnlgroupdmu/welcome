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
    contentMarkdown: ``
  }
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
  }
];

export const DEFAULT_MEMOS: MemoPost[] = [
  {

  }
];