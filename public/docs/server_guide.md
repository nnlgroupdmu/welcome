## 实验室 YF5090 服务器介绍

欢迎使用实验室最新双卡 NVIDIA RTX 5090D v2 (24GB) GPU 服务器。本服务器专为高性能深度学习任务设计，面向多数同学的日常科研需求，为了确保资源的高效利用与环境的稳定隔离，请遵循我们的工作流程。

---

🛠️ 环境配置

每人独立系统账号，使用 Docker container 代替 conda envs 管理项目环境。


⚖️ 资源使用规范

请使用 Task Spooler 提交任务，系统自动排队后分配显卡。


🚀 5090 服务器内网地址: 
```Plaintext
192.168.31.240
```
🚀 5090 服务器 Tailscale 地址: 
```Plaintext
yf5090
```
或
```Plaintext
100.68.153.123
```

📂 存储说明

个人目录: /home/username (工作区，建议放代码和模型)

归档、软件分享: /disk2/archive（管理员维护，用户只读）

公共数据区：/disk2/public（用于存储、分享、内网提交，新建自己名字的文件夹再使用）

移动存储设备: /media/yangfan5090/*your_usb_stick_name* （提前在自己电脑上改名，不要有空格、中文）

U盘拷入数据示例（线下方式）：(格式：cp -rp [源路径] [目标路径])

```bash
cp -rp /media/yangfan5090/[U盘名字]/data_folder  /home/[你的用户名]/work_dir/
# 移交权限
sudo chown -R [你的用户名]:[你的用户名] /home/[你的用户名]/work_dir/project_folder
```


Beta: 如果您需要寻求 AI 帮助，可以在对话的开头使用如下的提示词：（By ChatGPT）
```Prompt
你正在协助一名使用实验室共享深度学习服务器的研究生/学生用户排查问题或配置环境。请始终默认以下前提：

1. 服务器是实验室公共共享机器，宿主机权限受限，普通用户默认没有 root/sudo 权限；任何涉及宿主机提权、修改系统服务、改 Docker daemon、改驱动、改用户组等操作，都应视为管理员级操作，除非明确说明可由管理员执行，否则不要默认用户可以直接执行。
2. 用户的主要工作环境应以 Docker 容器为基本单元；优先给出容器内完成的方案。宿主机主要用于 SSH 登录、docker 管理、任务调度，不应默认在宿主机直接安装复杂深度学习环境。
3. 用户主要在服务器上进行深度学习实验、训练、调试、运行 Python/PyTorch 相关任务。请优先给出适合 Linux + Docker + SSH 的命令与操作步骤。
4. 这台服务器是 5090 Blackwell 架构，环境通常要求较新的 PyTorch / CUDA 版本；如果你建议依赖较旧版本库，请先说明兼容性风险，并尽量给出面向新版本环境的替代方案。
5. 用户常用工作流是：本地电脑通过 Tailscale / SSH / VS Code Remote Development 连接服务器；在 Docker 容器内配置项目环境并运行训练；通过所有用户共享的 task spooler（ts）在宿主机提交容器内任务。
6. 请尽量避免给出以下不适合该场景的建议：在宿主机上直接 sudo 安装依赖、默认使用 conda 作为首选、默认修改系统级配置、默认把代码和日志写在容器不可持久化路径、默认忽略 Docker 挂载路径与权限问题。
7. 回答时请明确区分“宿主机”和“容器内”两种环境；若命令会在不同环境执行，请分别标注。
8. 若问题存在多种解决方式，请优先推荐最稳妥、最适合共享服务器和容器化工作流的方案，并说明原因。
9. 如果某一步需要管理员权限、需要重启服务、可能影响其他用户、或可能破坏现有环境，请先明确提示风险，不要直接默认执行。
10. 若信息不足，请基于共享服务器、Docker、SSH、ts 的常见运维场景给出最小假设下的可执行建议，而不是要求用户先做大量额外操作。

我的实际问题是：
```

### 一、整体架构概览

本服务器采用**“云端组网 + 容器隔离 + 终端复用”**的三层架构，确保你在任何地方都能拥有稳定、一致的开发体验。

- **网络层 (Tailscale)：** 通过 Tailscale 建立云端组网，实现“实验室 WiFi 直连”与“校外远程 SSH”的无缝切换。
    
- **开发层 (SSH + VS Code)：** 推荐使用 VS Code 配合 Remote-Development 插件。所有代码编写、调试均在个人电脑端完成，通过 SSH 实时同步至服务器。
    
- **计算层 (Docker)：** 将所有任务在 Docker 容器中运行，可以实现完全隔离的安全环境。不建议长期项目、主要项目、或新同学的首个项目直接在宿主机 conda 配实验环境。Docker container 并不比 conda env 更难配置。

- **调度层 (Task Spooler)：** 强烈建议的任务提交方式。一个轻量的、跨用户共享的任务队列，有自动分配空闲显卡的功能。
    
- **保活层 (Tmux)：** 位于宿主机与容器之间，负责在网络波动或关闭电脑时，保持训练进程和终端会话持续运行。


### 二、日常工作流程

标准的操作路径如下，建议养成习惯以避免进程丢失：

|阶段|关键操作|命令/说明|
|---|---|---|
|**1. 接入**|启动 Tailscale 并连接 SSH|使用 `ssh username@yf5090` 进入服务器|
|**2. 保活**|创建或接入 Tmux 会话|`tmux a -t 项目名` 或 `tmux new -s 项目名`|
|**3. 环境**|启动/进入 Docker 容器|`docker start 容器名` -> `docker exec -it ...`|
|**4. 提交**|在宿主机 Task Spooler 提交训练任务|`ts -G 1 docker exec -i 容器名 python3 脚本`|
|**5. 挂起**|脱离 Tmux 会话|快捷键 `Ctrl + B`, 然后按 `D` (此时可关闭电脑)|

### 三、核心注意事项

- **硬件兼容性限制：** 由于 5090 Blackwell 架构较新，仅支持高版本 `PyTorch>=2.7.1`，`CUDA>=12.8`。若旧项目依赖复杂且无法升级，请考虑使用 3090/2080 服务器。
    
- **提交排队：** 请使用 `ts docker exec ...` 命令来提交训练任务，所有用户的任务将排队执行。
    
- **环境配置：** 容器内无需使用 Conda，建议直接通过 `pip install -r requirements.txt` 配置，并设置清华大学镜像源以确保速度。

---

## 1  准备工作

本服务器采用 **SSH + VS Code** 远程开发模式。
**个人电脑端**：安装 **VS Code** 或其他代码编辑软件（如 Cursor），并安装插件 **Remote Development**（不同软件可能有不同插件名）。

### 1.1 实验室外的连接准备

服务器接入 Tailscale 内网穿透，应对实验室以外使用 SSH 连接服务器的场景。

所有操作在个人电脑完成：

1. 下载安装 tailscale
2. 获取并使用 AuthKey 登录（详见[内网接入指南](vpn_guide.md)）
3. 在 tailscale 客户端右键菜单，取消勾选 allow incoming connection（建议设置，可保护个人电脑）
4. 此时个人电脑已经连入我们的 tailscale 组网，打开 vscode 准备进行 ssh 连接

### 1.2 注册在服务器 Ubuntu 系统上的个人用户

这一步有三种方式完成：
1. Todesk 连接桌面操作（不保证长期可用） ；
2. 在实验室线下操作桌面 ；
3. 联系管理员进行注册。

一旦打开终端，执行命令即可:

```bash
# 创建一个新用户（例如叫 username）
sudo adduser username
# 赋予他使用 Docker 的权限（这样他就不需要 sudo 密码了）
sudo usermod -aG docker username
```


### 1.3 首次 ssh 连接

连接流程：

1. 在 VS Code 按 `F1`或左下角`> <`，选择 `Remote-SSH: Connect to Host...`。
    
2. 输入：`ssh 你的用户名@服务器IP`（如：`ssh student_a@192.168.x.y`）。
    
3. 输入密码登录。


tailscale ssh 个人连接：
```Plaintext
username@yf5090
```

实验室 WiFi 局域网连接：
```Plaintext
username@192.168.31.240
```

> [!info]
> 「yf5090」是一个管理员设置的 Tailscale 魔法 DNS 链接，其等价于「100.68.153.123」。只要你连接了 Tailscale，就可以在 VS Code、浏览器等处使用「yf5090」代替数字地址。然而，它依赖 DNS 解析，与 Clash/本机设置 发生冲突等不能正常使用的情况，请关闭 TUN 模式或使用原始链接「100.68.153.123」。


使用自己账号登录的情况下，工作目录为 /home/*your_name*

**验证权限：** 连接成功后，在 VS Code 终端输入 `docker ps`。（如果无权限，则是注册时缺少了 `sudo usermod -aG docker username
`）

### 1.4 免密登录 

如果不想每次连 VS Code 都输密码，可以把的公钥传给服务器。

**在笔记本电脑终端执行：**

```PowerShell
# 1. 生成密钥对（如果已经有了就跳过）
ssh-keygen -t rsa

# 2. 将公钥拷贝到服务器（Windows 用这条，注意替换 用户名@IP）
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh YOUR_NAME@yf5090 "mkdir -p ~/.ssh && chmod 700 ~/.ssh &&cat >>
~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```


## 2  基于 Docker 的工作流

#### 结构概览：Docker 是如何工作的？

在服务器上，Docker 就像是一个集装箱运输船。

1. 宿主机 (Host)： 载体（服务器硬件 + 驱动）。

2. 镜像 (Image)： “环境的快照”。它是一个只读模板，包含了操作系统、CUDA、Python 及所有插件。

3. 容器 (Container)： “环境实例”。相当于conda env。你所有的代码运行、模型训练都在容器这个“独立房间”里进行。


#### Docker vs. Conda：相似与不同

很多同学习惯用 Conda，其实 Docker 可以看作是“加强版”的 Conda。


| **特性**      | **Conda 虚拟环境**               | **Docker 容器**                          |
| ----------- | ---------------------------- | -------------------------------------- |
| **隔离程度**    | **半隔离**。仅隔离 Python 包。        | **全隔离**。隔离了操作系统、系统库和 GPU 驱动接口。         |
| **一致性**     | 换台机器可能因为系统库不同而报错。            | 镜像在哪运行都一模一样|
| **CUDA 管理** | 经常遇到 Conda CUDA 与系统 CUDA 冲突。 | 镜像内置匹配好的 CUDA，开发者无需配置宿主机 CUDA。         |
| **清理难度**    | 卸载不干净容易残留垃圾文件。               | 删除容器/镜像即可彻底关掉并释放资源。                    |

#### Docker 核心工作流

作为新用户，你只需要掌握核心步骤即可开始实验：

- 第一步：挑选镜像
根据项目需求（如 PyTorch 版本），从实验室仓库挑选镜像。（强烈推荐管理员制作的基础镜像 `base_image` 。服务器上也包含 Pytorch 镜像和更基础的 ubuntu 镜像等。如有特殊需求，联系管理员拉取新镜像）

- 第二步：创建容器 (Run)
使用 docker run 命令创建容器，会自动启动（start）容器。关键点是要把服务器上的代码目录“映射”到容器里，这样你在容器里改代码，服务器的文件也会同步变。容器只需创建一次，除非删除，会一直保持你的项目环境。

- 第三步：进入容器开发 (Exec)
通过 VS Code 的远程插件或命令行，使用 SSH 连接容器或使用 docker exec 进入容器内部。在容器里你可以配置环境、调试程序。若容器未启动（stop），须先启动（start）

- 第四步：提交训练任务（ts）
为了大家有序利用GPU，把你的训练任务提交排队。形如：ts [ts参数] docker exec [docker参数] 容器名 python3 脚本名。详见[第3章](#3--任务队列-gpu-task-spooler)。

- 第五步：保存/停止 (Stop)
实验结束或需要修改配置时，可以停止容器（不是删除！）。如果环境配置非常辛苦，还可以把容器“导出”成新镜像。



> [!WARNING]
> 由于 5090 全新的 Blackwell 架构，必须使用 `PyTorch>=2.7.1`，`CUDA>=12.8` 提供 GPU 计算支持，而高的 Pytorch 版本只支持高的 Python 版本。
> 
> 因此，旧版本 Pytorch 是不可用的，所以我们基于 Pytorch 的**基础镜像**： [pytorch/pytorch:2.7.1-cuda12.8-cudnn9-devel](https://hub.docker.com/layers/pytorch/pytorch/2.7.1-cuda12.8-cudnn9-devel/images/sha256-3d614dfd422b7e43647491cbf07d6acc516c032fc49c594a94afdebd52552fb9) 加上了一些基础组件，构建了供大家使用的基础镜像（base_image）
> 
> 配置新项目环境时，我们强烈推荐从这个基础镜像开始，**优先保证 Pytorch 的版本正确**，调整其他包的版本，以及利用 AI 调整项目的旧版本 Pytorch 代码。如果你有需要其他镜像的情况，可先使用 `docker images` 查看服务器本地是否有该镜像，若无，请联系管理员拉取镜像。

因此，如果您的需求是**环境依赖复杂的旧项目**，训练不密集的情况，考虑我们的 3090 或 2080 服务器 可能是更优的。


### 2.1 使用镜像创建容器

创建容器就是新建你的项目运行环境。注意：我们最好先下载代码，创建好需要的工作区目录。

```bash
# 建议项目放在用户下
cd /home/yourname

# 下载你项目的代码，会新建一个项目文件夹: /home/YOUR_NAME/PROJECT_NAME
git clone https://github.com/nnlgroupdmu/XXXXX.git

# 你可能希望重命名这个文件夹
# 语法：mv [原文件夹名] [新文件夹名]
mv XXXXX project_name
```

我们已经有了代码和项目文件夹，下一步就是创建容器，并把项目文件夹路径映射到容器内。

以我们推荐的的基础镜像为例：

```bash
# 查看所有容器
docker ps -a
# 查看已占用端口
checkport

# 新建容器 注意替换容器名和项目路径
docker run -d \
  --name="[用户名]_[项目名]" \
  --gpus all \
  --shm-size=48g \
  -p [10000-19999之间的唯一端口]:22 \
  -v /home/[用户名]/[项目文件夹]:/home/[用户名]/[项目文件夹] \
  -v /disk2/archive:/disk2/archive:ro \
  -v /disk2/public:/disk2/public:rw \
  --restart always \
  --env LANG=C.UTF-8 \
  base_image:v1
```

- **端口建议**：请在 `10001-19999` 之间选择一个未被占用的唯一端口。在终端执行 `checkport` 查看已占用端口。如果你不知道怎么选，可以用“1+学号后两位+两位项目编号”。
    
- **数据挂载**：`/disk2` 为数据盘，/disk2/archive 存放方便大家取用的大型公共数据集、归档文件、一些预下载的软件包；/disk2/public 为公共数据区（可写，可上传共享）；你的个人代码请存放在 `/home/[用户名]` 下。

这里面 `/PATH/TO/YOUR/PROJECT:/PATH/TO/YOUR/PROJECT ` 是 `[宿主机路径] 映射: [容器内路径]`，请务必设置，然后把项目的代码和数据集放到服务器端的 `[宿主机路径]`。

之后这个项目就在容器里操作了。你可以通过指令进入容器内部：

```bash
docker exec -it [容器名] /bin/bash
```

或者，你可以利用配置的端口号，直接把 VS Code 通过 ssh 连到容器内部，这样更方便使用 ai agent 调用容器环境。这是最推荐的开发方式，体验与本地写代码一致。

1. **安装插件**：确保本地 VS Code 安装了 `Remote - SSH` 插件。
2. **添加主机**：点击左下角 `> <` 图标 -> `Open SSH Config File`，添加以下配置：

    ```Plaintext
    Host [容器名]
        HostName 192.168.31.240
        User root
        Port [你设置的端口1XXXX]
    ```
    
3. **登录**：点击VS code左下角 `> <` 按钮 -> Connect to Host -> 选择容器名点击连接，初始密码为：`123456`。（你可以修改，以及配置免密登录）

进入容器后，你可以运行以下命令确认环境正常：

- **检查 GPU**：`nvidia-smi`
    
- **检查 PyTorch**：`python -c "import torch; print(torch.cuda.is_available())"`
    
- **检查编译器**：`nvcc -V`

#### 提醒：

1. **持久化**：请务必将代码、实验日志、模型权重保存在你的 `/home/[用户名]` 挂载目录下。删除容器不会丢失这些数据，但存放在容器其他路径（如 `/root`）的数据在容器删除后会**永久消失**。
    
2. **公共资源**：`/disk2` 为只读挂载，请勿尝试在该目录下生成日志或保存模型。



### 2.2 环境配置

由于使用了 docker，环境是非常独立而安全的，不需要再使用 conda。2026 年初几乎所有 conda 源全部失效。我们推荐使用 pip 安装环境。（如果你想，你仍然可以在容器里使用 conda）

既然镜像里已经预装了对应 CUDA 12.8 的高性能 Python 和 PyTorch，直接用 `pip` 是最稳的。

**永久更换 Pip 源为国内镜像（我们提供的基础镜像默认启用了这个设置）：**

``` Bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

#### **怎么写清单？**

相当于 conda 的 yaml 文件，你可以手动创建一个名为 `requirements.txt` 的文件，每行写一个包名（可以指定版本，也可以不指定）：

```Plaintext
# requirements.txt 内容示例
numpy
pandas>=2.0.0
transformers
accelerate
scipy==1.10.1
```

#### **如何一句话安装？**

在你的新容器里，执行这一行命令即可自动按清单下载所有包：

```Bash
pip install -r requirements.txt
```

### Docker 指令速查表

``` bash
# 查看已有镜像
docker images
# 查看所有容器
docker ps -a
# 查看当前运行的容器
docker ps
# 启动容器
docker start 容器名
# 停止容器
docker stop 容器名
# 进入容器
docker exec -it 容器名 /bin/bash
# 退出容器
exit
# 删除容器
docker rm 容器ID/名称
```

### 附录

#### base_image 镜像特性（具体可查 Dockerfile）

1. 远程开发支持 (SSH-Native)
服务常驻：内置 openssh-server，启动即监听 22 端口。等同于手动执行 apt install openssh-server && /usr/sbin/sshd -D。
认证打通：预设 root 密码并允许远程登录。修改了 /etc/ssh/sshd_config 中的 PermitRootLogin。
连接优化：放宽了 PAM 模块对 loginuid 的限制，解决 VS Code Remote-SSH 连接时的身份校验延迟与断连问题。

2. 环境变量持久化 (Path-Fixed)
全场景生效：路径注入 /etc/environment 和 /etc/profile。
免配置调用：确保 SSH 登录后可直接识别 python, nvcc, conda。效果等同于每次登录手动执行 export PATH=/opt/conda/bin:/usr/local/cuda/bin:$PATH。
Shell 兼容：通过 ~/.bashrc 自动 source /etc/profile，确保 docker exec 与 ssh 终端环境一致。

3. 国内网络加速 (Mirror-Standard)
APT 换源：/etc/apt/sources.list 已切换至清华大学镜像。等同于手动执行 sed -i 替换官方域名。
PIP 换源：全局配置 index-url 为清华源。等同于手动执行 pip config set global.index-url ...。

4. 系统级依赖补全 (Lib-Dependency)
视觉算法支持：预装 libgl1-mesa-glx 和 libglib2.0-0。解决 import cv2 (OpenCV) 时常见的 .so 动态库缺失报错。
基础工具链：集成 vim, tmux, git, wget, curl。满足在容器内进行文本编辑、长耗时任务挂起与版本控制的需求。

**本章重要参考**：
基于docker的深度学习配环境秘笈(配环境,看这一篇就够了) https://www.acwing.com/blog/content/62230/ 


## 3  任务队列 GPU Task Spooler

[GPU Task Spooler](https://github.com/justanhduc/task-spooler)，简称 ts，是一个有助于轻松管理 CPU/GPU 任务的假脱机系统。你可以把它当成 SLURM（学校超算用的那个），但它适用于小型单个服务器而不是高性能集群。

使用 ts 后，所有被提交的任务按顺序组成队列，通过我们设定好的窗口（两张显卡的窗口，同时允许两个任务）。ts 的美妙在于，你不再需要关心 CUDA_VISIBLE_DEVICES。只需通过 `-G` 参数指定需要的显卡数量，ts 将自动分配闲置显卡。（占用小于 10% 的显卡视为闲置）

为了大家的任务能有序进行，**建议所有人都使用 ts 提交任务**。这样一来，无论是否有空闲的卡，您都可以用一致的一条命令把任务提交上去。

要在宿主机通过 `ts` 启动容器内的 Python 任务，核心逻辑是：

`ts [ts参数] docker exec [docker参数] 容器名 python3 脚本名`

也就是说，和 docker 一节所介绍的 “先 exec 进入容器，然后在容器里执行任务脚本” 所不同，使用 ts 的命令必须在宿主机执行。 如上的命令可以实现在**宿主机环境执行容器中的脚本**。

如果你把所有的库都装在了容器中系统的 `root` 环境下（即没有使用 Conda 或 venv 隔离），那么操作起来是更简单的。

### 3.1 一句话提交任务

在这种情况下，容器内的 `/usr/bin/python3`（或 `python`）就已经包含了你所需要的所有深度学习框架（PyTorch, TensorFlow 等）。你不需要执行任何“激活”动作，直接调用即可。
#### 示例：提交一个训练任务到队列

```Bash
ts -G 1 docker exec -i my_container python3 /home/username/project/train.py --epochs 10
```

- **`-G 1`**: 告知 `ts` 该任务占用 1 个显卡。
- **`docker exec`**: 在运行中的容器内执行命令。

### 3.2 任务脚本：在宿主机脚本中处理激活等逻辑

你可能需要的不仅是执行 `train.py`。比如，`source`、`conda activate`。

这是**最推荐**的做法。你可以在宿主机写一个 `job_train.sh`。推荐在项目根目录下开一个 `project/jobs` 文件夹专门放需要的任务脚本，下面的示例利用脚本的位置确定项目根目录。
针对 docker 容器内部的环境配置方法，我们分三种情况讨论。

#### 1. Root 环境（直接在容器系统中配置）

这是最简单的模式，环境是“全局可见”的。**特点**：不需要激活，直接调用。
**job.sh 逻辑**：

```Bash
#!/bin/bash
# 1. 获取项目根目录（假设job脚本放在 project/jobs/job_train.sh，利用"/.."找上一级的项目根目录 ）
PROJECT_ROOT=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )/..
cd "$PROJECT_ROOT"

# 2. 导出路径（防止有些包没装进系统路径）
export PYTHONPATH=$PROJECT_ROOT:$PYTHONPATH

# 3. 直接执行
# 此时 python3 指向的就是 /usr/bin/python3
python3 train.py
```

#### 2. venv 环境（轻量级虚拟环境）

`venv` 依赖于一个包含软链接的 `bin` 文件夹。**特点**：通过 `source` 脚本来修改当前 Shell 的 `PATH`。

 **job.sh 逻辑**：

```Bash
#!/bin/bash
PROJECT_ROOT=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )/..
cd "$PROJECT_ROOT"

# 1. 激活 venv
# 必须使用 source，确保 PATH 被修改
source ./.venv/bin/activate

# 2. 执行（此时 python 自动指向 .venv 内部）
python train.py
```

#### 3. Conda 环境（复杂的二进制包管理）

Conda 不仅仅是 Python 环境，它还管理 C++ 库和 CUDA 运行时，因此它的激活逻辑最复杂。**特点**：直接 `source activate` 在非交互式 Shell（如 `docker exec`）中经常失效，必须先初始化 `conda shell`。
**job.sh 逻辑**：

```Bash
#!/bin/bash
PROJECT_ROOT=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )/..
cd "$PROJECT_ROOT"

# 1. 初始化 Conda 路径（关键：定位 conda.sh）
# 常见的路径有 /opt/conda/etc/profile.d/conda.sh 或 ~/anaconda3/...
CONDA_PATH="/opt/conda/etc/profile.d/conda.sh"
if [ -f "$CONDA_PATH" ]; then
    source "$CONDA_PATH"
else
    echo "Error: conda.sh not found!"
    exit 1
fi

# 2. 激活环境
conda activate my_env_name

# 3. 执行
python train.py
```


**然后用 `ts` 提交这个脚本：**

```Bash
ts -G 1 docker exec -i [容器名] bash /home/yourname/project/jobs/job_train.sh
```
注意修改容器名和路径。

### 3.3 如何优雅地查看输出

由于 `ts` 会捕获标准输出，而 Docker 的输出有时带有颜色字符，你可以这样操作：

- **实时监控任务日志**：
    
    ```Bash
    ts -c 0  # 0 是任务 ID
    ```
    
    _注：这就像在看容器内部的实时控制台。_
    

- **查看任务状态列表**：
    
    ```Bash
    ts
    ```

### 3.4 常见问题

#### Q：找不到训练脚本的路径（Docker 路径映射）

A：使用 `docker exec` 时，**Python 脚本的路径必须是“容器内部”的路径**。也因此，我们建议容器和宿主机的目录映射保持命名的一致，减少不必要的复杂性。

#### Q：我的 ts 训练任务不想跑了，怎么停止？

A：先杀 ts 任务，再关容器内的 python。为了减少这种困惑，**请尽量在提交时确定需要跑的轮次，不要依赖手动停止**！控制好自己的运行时间，共同维护排队秩序！
```bash
ts  # 查看 ts 任务列表
ts -k [id]  # 停止你的任务
docker ps   # 查看所有运行的容器
docker exec -i [容器名] pkill -f python # 停掉你容器中的 Python
```



### Task Spooler 指令速查表

| **场景**           | **命令**                                 |
| ---------------- | -------------------------------------- |
| **查看当前队列**       | `ts`                                   |
| **提交 Docker 任务** | `ts docker exec [Name] python3 [Path]` |
| **强制占用 2 张卡**    | `ts -G 2 docker exec ...`              |
| **实时看容器输出**      | `ts -c [ID]` (按 Ctrl+C 退出查看，不影响运行)     |
| **停止/杀死任务**      | `ts -k [ID]`                           |
| **清除已完成任务**      | `ts -C`                                |
| **调整任务优先级**      | `ts -u [ID]` (把任务往上提)                  |




## 4  Tmux 终端复用

如果您使用前文所述的 VS Code 远程连接、ts 任务提交的工作流，大可根据个人习惯省略此章 tmux 的使用。

对于远程 SSH 开发，`tmux` 最核心的价值在于：解耦了“会话”与“连接”。尽管在我们的现代开发流程中，tmux 不再是必选项（vscode server 保护了 ssh 连接、docker daemon 保护了容器），它依然有重要意义：即便校园网断了、你合上了笔记本电脑、或者 SSH 掉线了，你重新连接后，只要重新连接`tmux`，那么`tmux`终端中**打开的窗口**、**终端的输出信息**都能瞬间“还原”。

有两种使用 tmux 的思路：
1. 宿主机 tmux
2. 容器内 tmux

| **特性**   | **方案一：宿主机 Tmux**         | **方案二：容器内 Tmux**        |
| -------- | ------------------------ | ----------------------- |
| **保活范围** | 宿主机进程 + 容器输出             | 仅限容器内部任务                |
| **适用场景** | 保护全局工作现场（终端日志和报错 / 窗口管理） | 同一容器内的任务多开（新窗口直接是容器内状态） |

对于方案一，管理员已为所有用户安装 tmux。可以直接使用。

对于方案二：在 docker 容器内部启动 tmux，需要在容器中执行安装命令：

```bash
apt-get install tmux
```

我们推荐从方案一开始使用，如有需要同一容器跑多个并行任务的情况，再切换到方案二。

> [!info] 为什么不 tmux-container-tmux 三层嵌套？
> 理想的嵌套结构是：
> **SSH (连接)** -> **Tmux (宿主机层，保活)** -> **Docker (容器层，隔离环境)** -> **Tmux (容器内层，多任务并行)**
> 
> 然而，这会导致：「按下 `Ctrl+B` 时，到底是外层的 tmux 响应，还是内层的响应？」
> 
 > 解决方案也有：
 >  - **方法 A（按两次）**：连按两次 `Ctrl+B`。通常第一次会发给外层，第二次会穿透发给内层。
> - **方法 B（改快捷键）**：把容器内部的 `tmux` 快捷键改掉。
>
> 但是，这种嵌套显得臃肿。不作推荐。

### 4.1 推荐的工作流程

#### 第一步：创建并进入会话

不要直接在登录后的原始终端里跑代码。

```Bash
# 创建一个名为 "train" 的会话
tmux new -s train
```

#### 第二步：日常操作（记住快捷键前缀 `Ctrl+B`）

`tmux` 的所有指令都需要先按 `Ctrl + B`（松开），然后再按功能键：

- **分屏（左右）**：`Ctrl + B` 然后按 `%`
- **分屏（上下）**：`Ctrl + B` 然后按 `"`
- **切换分屏**：`Ctrl + B` 然后按方向键
- **新建窗口**（像浏览器标签一样）：`Ctrl + B` 然后按 `c`
- **关闭窗格**： `Ctrl + B` 然后按 `x`

#### 第三步：安全脱离（Detach）

`tmux` 的所有指令都需要先按 `Ctrl + B`（松开），然后再按功能键。

这是最关键的一步。当你要下班回家时：
1. 按 `Ctrl + B`，然后按 `d`。
2. 你会回到原始的 SSH 终端，提示 `[detached]`。
3. **现在你可以放心关掉电脑了。**

#### 第四步：重新连接（Attach）

第二天来到实验室，SSH 连上服务器后：

```Bash
# 查看有哪些会话在后台
tmux ls
# 重新进入名为 "train" 的会话，一切都在原地等候
tmux attach -t train
```

### 4.2 与 Docker 的完美配合

在服务器上，建议这样操作：
1. **先开 tmux**：登录 SSH 后立即 `tmux new -s my_project`。
2. **进入 Docker**：在 `tmux` 窗口内执行 `docker run -it ... /bin/bash`。
3. **开始训练**：在 Docker 内部跑起 Python 脚本。
4. **脱离**：`Ctrl+B, d`。
- _即使你退出了 SSH，Docker 容器依然在 tmux 的包裹下稳健运行。_

现在的练习建议：
1. SSH 连接后，执行 `tmux new -s test`。
2. 在里面执行 `watch -n 1 nvidia-smi`（监控显卡）。
3. 按 `Ctrl+B, d` 退出。
4. **直接关掉你的终端窗口。**
5. 重新打开终端 SSH 连上去，输入 `tmux attach -t test`。

看到显卡监控依然在跳动吗？这就是 `tmux` 的魅力。


### 4.3 常见问题

#### Q：我不能拖动选中终端中的文本进行复制

A：如果你发现不能左键拖动选中终端中的文本，这是因为 tmux 接管了鼠标逻辑。按住 `shift` 来执行常规的左键拖动选中。

### Tmux 指令速查表

|**命令**|**功能**|
|---|---|
|`tmux new -s <name>`|**新建会话**。建议用项目名命名（如 `tmux new -s train`）。|
|`Ctrl + b` 然后按 `d`|**脱离**(Detach)。任务继续跑，你安全退出当前窗口。|
|`tmux ls`|**查看后台列表**。看看你有哪些“桌子”还在开着。|
|`tmux a -t <name>`|**接入**(Attach)。重新回到之前的会话窗口。|
|`exit`|**彻底关闭**。在会话窗口内输入，会销毁该会话。|

## 附录

### 硬件参数

| **硬件类别**          | **配置详情**                         | **备注 / 适用场景** |
| ----------------- | -------------------------------- | ------------- |
| **中央处理器 (CPU)**   | AMD Ryzen™ 9 9900X               | 共 12 核心       |
| **系统内存 (RAM)**    | 96GB DDR5                        | 共享内存，请勿恶意挤占   |
| **图形处理器 (GPU)**   | NVIDIA RTX 5090D v2 x2           | 单卡显存  24GB    |
| **系统盘 (SSD)**     | `/` 快速系统盘                        | 仅用于存放容器系统依赖   |
| **数据盘 (SSD/HDD)** | `/home` (工作区盘) \| `/disk2` (数据盘) | 核心存储区域        |
