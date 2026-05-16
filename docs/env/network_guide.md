
## Clash for Linux 快速部署

GitHub 项目 [clash-for-linux-install](https://github.com/nelvko/clash-for-linux-install) 可以在终端和容器环境快速部署 clash 环境。

> - 支持一键安装 `mihomo` 与 `clash` 代理内核。
> - 兼容 `root` 与普通用户环境。
> - 适配主流 `Linux` 发行版，并兼容 `AutoDL` 等容器化环境。
> - 自动检测端口占用情况，在冲突时随机分配可用端口。
> - 自动识别系统架构与初始化系统，下载匹配的内核与依赖，并生成对应的服务管理配置。
> - 在需要时调用 [subconverter](https://github.com/tindy2013/subconverter) 进行本地订阅转换。

然而，初次使用仍然会遇到下载过慢、需手动下载其依赖的问题。5090 服务器已提供归档的软件包，您可以随意拷贝和下载使用 `/disk2/archive/clash-for-linux-install/clash-for-linux-share.tar.gz`

> Beta:
> 尝试我们的内网软件站点进行下载：
> http://192.168.31.240:5244/

本手册旨在指导用户在不具备管理员 (`sudo`) 权限的情况下，如何在自己的个人目录下安装并运行 Clash 代理服务。

## 一、 环境准备与解压

首先，在你的个人 `home` 目录下创建工作目录，并将公共软件包拷贝至此处解压。

```bash
# 1. 创建并进入测试目录
mkdir -p ~/clash_test && cd ~/clash_test

# 2. 从服务器公共归档位置拷贝安装包
cp /disk2/archive/clash-for-linux-install/clash-for-linux-share.tar.gz .

# 3. 解压软件包
tar -xzvf clash-for-linux-share.tar.gz
```

## 二、 启动与安装

执行安装脚本。脚本会自动检测端口占用情况，如果默认端口被他人占用，系统会自动为你分配随机端口。

```bash
cd clash-for-linux-install/
bash install.sh
```

### 注意事项：端口冲突处理

安装过程中，如果看到以下提示，请**记录**脚本生成的端口，以备登录 Web 控制台需要：
*   🎯 端口冲突 [mixed-port]：这是你的代理端口（如 `29017`），用于程序代理。
*   🎯 端口冲突 [external-controller]：这是你的控制台端口（如 `49981`），用于 Web 界面管理，需要在登录 Web 控制台时填入。
*   😼 当前密钥 (Secret)：用于登录 Web 控制台的凭证，需要在登录 Web 控制台时填入。

## 三、 配置订阅链接
安装完成后，系统会提示你输入订阅链接。如果错过提示，可使用命令行手动添加并激活：

```bash
# 1. 添加订阅链接
clashctl sub add "你的订阅地址"

# 2. 更新订阅文件（确保获取到最新的节点）
clashsub update 1

# 3. 激活并应用该订阅
clashsub use 1
```

## 四、 开启代理与验证
使用内置命令开启环境，并验证网络连通性。

```bash
# 1. 开启代理环境变量
clashon

# 2. 测试访问（如返回 HTTP 200 OK 则表示成功）
curl -I www.google.com
```

> **小贴士**：如果需要关闭代理环境，输入 `clashoff` 即可。

## 五、 Web 控制台管理

为了更直观地切换节点，你可以使用 Web 控制台：
输入 `clashctl ui` ，在自己电脑打开“内网”地址（如 `http://192.168.31.240:9090/ui`），填入以下信息：
*   **Host**: 服务器 IP `192.168.31.240` 或 Tailscale 地址。
*   **Port**: 填入脚本随机分配的 `external-controller` 端口（输入`clashctl ui` 提示注意放行的端口）。
*   **Secret**: 填入脚本生成的密钥。

## 六、 常用命令汇总
| 命令                     | 说明          |
| :--------------------- | :---------- |
| `clashon`              | 开启当前终端代理    |
| `clashoff`             | 关闭当前终端代理    |
| `clashsub update 1`    | 更新第一个订阅     |
| `clashsub use 1`       | 切换到第一个订阅的节点 |
| `clashctl sub add URL` | 添加新的订阅      |

