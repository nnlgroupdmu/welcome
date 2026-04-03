# 欢迎使用实验室在线文档

服务器仅限实验室 WiFi 局域网环境访问；

外网环境请联系管理员获取公用账号，并按[深度学习服务器指南](env/server_guide.md)进行配置。

🚀 登录地址: 
```Plaintext
ssh username@192.168.31.240
```

---

🛠️ 环境配置

每人独立系统账号，使用 Docker container 代替 conda envs 管理项目环境，请勿直接在系统 Python 下安装包。

---

⚖️ 资源使用规范

显存监控: 运行前请执行 nvidia-smi 确认是否有空余卡。

---

📂 存储说明

个人目录: /home/username (建议放代码和模型)

归档 / 拷贝中转（用户只读）: /disk2

移动存储设备: /media/yangfan5090/*your_usb_stick_name* （提前在自己电脑上改名，不要有空格、中文）

U盘拷入数据示例：(格式：cp -rp [源路径] [目标路径])

```bash
cp -rp /media/yangfan5090/your_usb_stick_name/data_folder  /home/your_username/work_dir/
```

