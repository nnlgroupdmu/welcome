## 摘要

欢迎使用实验室 **5090 Blackwell 架构服务器**。本服务器专为高性能深度学习任务设计，为了确保资源的高效利用与环境的稳定隔离，请遵循以下架构逻辑与工作流程。

### 一、 整体架构概览

本服务器采用**“云端组网 + 容器隔离 + 终端复用”**的三层架构，确保你在任何地方都能拥有稳定、一致的开发体验。

- **网络层 (Tailscale)：** 通过实验室公共 GitHub 账号接入 Tailscale 内网穿透，实现“实验室 WiFi 直连”与“校外远程 SSH”的无缝切换。
    
- **开发层 (SSH + VS Code)：** 推荐使用 VS Code 配合 Remote-Development 插件。所有代码编写、调试均在个人电脑端完成，通过 SSH 实时同步至服务器。
    
- **计算层 (Docker)：** **原则上禁止在宿主机直接配实验环境。** 5090 显卡强制要求 PyTorch≥2.7.1，所有任务必须在 Docker 容器中运行，以实现环境完全隔离。
    
- **保活层 (Tmux)：** 位于宿主机与容器之间，负责在网络波动或关闭电脑时，保持训练进程和终端会话持续运行。

### 二、 日常工作流程

标准的操作路径如下，建议养成习惯以避免进程丢失：

|阶段|关键操作|命令/说明|
|---|---|---|
|**1. 接入**|启动 Tailscale 并连接 SSH|使用 `ssh username@yf5090` 进入服务器|
|**2. 保活**|创建或接入 Tmux 会话|`tmux a -t 项目名` 或 `tmux new -s 项目名`|
|**3. 环境**|启动/进入 Docker 容器|`docker start 容器名` -> `docker exec -it ...`|
|**4. 运行**|指定显卡并开始训练|`CUDA_VISIBLE_DEVICES=0 python train.py`|
|**5. 挂起**|脱离 Tmux 会话|快捷键 `Ctrl + B`, 然后按 `D` (此时可关闭电脑)|

### 三、 核心注意事项

- **硬件兼容性限制：** 由于 5090 Blackwell 架构较新，仅支持高版本 PyTorch。若旧项目依赖复杂且无法升级，请考虑使用 3090/2080 服务器。
    
- **存储映射：** 创建容器时务必使用 `-v [宿主机路径]:[容器路径]` 进行挂载，否则容器一旦删除，其内部数据（如权重文件）将全部丢失。
    
- **显存礼仪：** 训练前请执行 `nvidia-smi` 查看占用，严禁在显存不足的情况下强行启动任务，以免导致集体宕机。
    
- **环境配置：** 容器内不推荐使用 Conda，建议直接通过 `pip install -r requirements.txt` 配置，并设置清华大学镜像源以确保速度。

---

## 1  准备工作

本服务器采用 **SSH + VS Code** 远程开发模式。
**个人电脑端**：安装 **VS Code** 或其他代码编辑软件（如 Cursor），并安装插件 **"Remote Development"**（不同软件可能有不同插件名）。

### 1.1 实验室外的连接准备

服务器接入 Tailscale 内网穿透，应对实验室以外使用 SSH 连接服务器的场景。

核心架构：公共账号 + 组织化管理

- **账号体系**：注册了一个实验室专用的 **GitHub 公共账号**。
    
- **登录模式**：所有实验室服务器和同学的个人笔记本，统一使用该 GitHub 账号登录 Tailscale 客户端（不会抢占下线），形成基于 tailscale 的设备组网。这样一来，同学们可以从外部 SSH 连接到服务器。
    
- **优势**：免去了逐个分享设备的繁琐，新同学加入只需登录账号即可瞬间看到所有实验资源。

所有操作在个人电脑完成：

1. 下载安装 tailscale
2. 在 tailscale 客户端登录实验室的 GitHub 公共账号（跳转到网页登录）
3. 在 tailscale 客户端右键菜单，取消勾选 allow incoming connection（建议设置，可保护个人电脑）
4. 此时个人电脑已经连入我们的 tailscale 组网，打开 vscode 准备进行 ssh 连接

### 1.2 注册个人账号

这一步有三种方式完成：
1. Todesk 连接桌面操作（不保证长期可用） ；
2. 在实验室线下操作桌面 ；
3. 先依上文配置 tailscale ，再根据下文使用公共账号 `yangfan5090` 进行一次 ssh 连接（详见 1.3），并完成注册。

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


tailscale 公用账号 ssh 连接：
```Plaintext
yangfan5090@yf5090
```

tailscale ssh 个人连接：
```Plaintext
username@yf5090
```

实验室 WiFi 局域网连接：
```Plaintext
username@192.168.31.240
```


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


> [!WARNING]
> 由于 5090 全新的 Blackwell 架构，必须使用 **Pytorch >= 2.7.1**提供 GPU 计算支持，而高的 Pytorch 版本只支持高的 Python 版本。
> 
> 因此，旧版本 Pytorch 是不可用的，所以我们只提供**基础镜像**： [pytorch/pytorch:2.7.1-cuda12.8-cudnn9-devel](https://hub.docker.com/layers/pytorch/pytorch/2.7.1-cuda12.8-cudnn9-devel/images/sha256-3d614dfd422b7e43647491cbf07d6acc516c032fc49c594a94afdebd52552fb9)
> 
> 配置新项目环境时，我们推荐从这个基础镜像开始，**优先保证 Pytorch 的版本正确**，调整其他包的版本，以及利用 AI 调整项目的旧版本 Pytorch 代码。

因此，如果您的需求是**环境依赖复杂的旧项目**，训练不密集的情况，考虑我们的 3090 或 2080 服务器 可能是更优的。

**重要参考**：
基于docker的深度学习配环境秘笈(配环境,看这一篇就够了) https://www.acwing.com/blog/content/62230/ 

### 2.1 **使用镜像创建容器**

以我们的 Pytorch 基础镜像为例：

```bash
# 查看所有容器
docker ps -a

# 新建容器 注意替换容器名和项目路径
docker run --name="YOUR_CONTAINER" --gpus all -it -v /PATH/TO/YOUR/PROJECT:/PATH/TO/YOUR/PROJECT pytorch/pytorch:2.7.1-cuda12.8-cudnn9-devel /bin/bash
```

这里面 `/PATH/TO/YOUR/PROJECT:/PATH/TO/YOUR/PROJECT ` 是 `[宿主机路径] 映射: [容器内路径]`，请务必设置，然后把项目的代码和数据集放到服务器端的 `[宿主机路径]`。

之后这个项目就在容器里操作了。

常用命令：

``` bash
# 查看已有镜像
docker images
# 查看历史容器
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

如果你有需要其他镜像的情况，可先使用 `docker images` 查看服务器本地是否有该镜像，若无，请联系管理员拉取镜像。

### 2.2 **环境配置**

由于使用了 docker，环境是非常独立而安全的，不需要再使用 conda。2026 年初几乎所有 conda 源全部失效。我们推荐使用 pip 安装环境。

既然镜像里已经预装了对应 CUDA 12.8 的高性能 Python 和 PyTorch，直接用 `pip` 是最稳的。

**永久更换 Pip 源为国内镜像：**

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

## 3  Tmux 终端复用

对于远程 SSH 开发，**`tmux` 最核心的价值在于：解耦了“会话”与“连接”**。尽管在我们的现代开发流程中，tmux **不再是必选项**（vscode server 保护了 ssh 连接、docker daemon 保护了容器），它依然有重要意义：即便校园网断了、你合上了笔记本电脑、或者 SSH 掉线了，你重新连接后，只要重新连接`tmux`，那么`tmux`终端中**打开的窗口**、**终端的输出信息**都能瞬间“还原”。

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
> **SSH (连接)** $\rightarrow$ **Tmux (宿主机层，保活)** $\rightarrow$ **Docker (容器层，隔离环境)** $\rightarrow$ **Tmux (容器内层，多任务并行)**
> 
> 然而，这会导致：「按下 `Ctrl+B` 时，到底是外层的 tmux 响应，还是内层的响应？」
> 
 > 解决方案也有：
 >  - **方法 A（按两次）**：连按两次 `Ctrl+B`。通常第一次会发给外层，第二次会穿透发给内层。
> - **方法 B（改快捷键）**：把容器内部的 `tmux` 快捷键改掉。
>
> 但是，这种嵌套显得臃肿。不作推荐。

### 3.1. 推荐的工作流程

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

### 3.2 与 Docker 的完美配合

在你的 5090 服务器上，建议这样操作：
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

**看到显卡监控依然在跳动吗？这就是 `tmux` 的魅力。

> [!info] 
> 在开始训练任务前，养成查看显卡占用情况的习惯。通过显式指定使用的显卡，防止爆显存影响自己和其他同学的任务。

#### **在命令行中指定显卡**

这是最常用的方式，只对当前运行的这一个命令生效。

```Bash
# 只使用 0 号显卡运行程序
CUDA_VISIBLE_DEVICES=0 python train.py
# 只使用 1 号显卡运行程序
CUDA_VISIBLE_DEVICES=1 python train.py
```
- **注意**：`CUDA_VISIBLE_DEVICES` 必须放在命令的最前面，且中间没有空格。

### 3.3 tmux 常用命令

|**命令**|**功能**|
|---|---|
|`tmux new -s <name>`|**新建会话**。建议用项目名命名（如 `tmux new -s train`）。|
|`Ctrl + b` 然后按 `d`|**脱离 (Detach)**。任务继续跑，你安全退出当前窗口。|
|`tmux ls`|**查看后台列表**。看看你有哪些“桌子”还在开着。|
|`tmux a -t <name>`|**接入 (Attach)**。重新回到之前的会话窗口。|
|`exit`|**彻底关闭**。在会话窗口内输入，会销毁该会话。|


