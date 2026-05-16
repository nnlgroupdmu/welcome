# 欢迎使用 506 实验室在线文档

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docsify](https://img.shields.io/badge/docsify-4.0-blue.svg)](https://docsify.js.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/nnlgroupdmu/welcome/graphs/commit-activity)

欢迎使用实验室最新的 5090 服务器！请参考[深度学习服务器指南](env/server_guide.md)进行配置。

服务器可在实验室 WiFi 局域网环境直接连接；公网环境请联系管理员获取 Tailscale 账号。

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

---

🛠️ 环境配置

每人独立系统账号，使用 Docker container 代替 conda envs 管理项目环境。

---

⚖️ 资源使用规范

请使用 Task Spooler 提交任务，系统自动排队后分配显卡。

---

📂 存储说明

个人目录: /home/username (工作区，建议放代码和模型)

归档、软件分享: /disk2/archive（管理员维护，用户只读）

公共数据区：/disk2/public（用于存储、分享、内网提交）

移动存储设备: /media/yangfan5090/*your_usb_stick_name* （提前在自己电脑上改名，不要有空格、中文）

U盘拷入数据示例（线下方式）：(格式：cp -rp [源路径] [目标路径])

```bash
cp -rp /media/yangfan5090/[U盘名字]/data_folder  /home/[你的用户名]/work_dir/
# 移交权限
sudo chown -R [你的用户名]:[你的用户名] /home/[你的用户名]/work_dir/project_folder
```

