# NNL Group Lab: Open Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docsify](https://img.shields.io/badge/docsify-4.0-blue.svg)](https://docsify.js.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/nnlgroupdmu/welcome/graphs/commit-activity)

Our group website for daily navigation usage and open documentation management.

这里是我们实验室的网站，面向日常使用和文档管理。

欢迎同学们使用实验室最新的 5090 服务器！请参考[深度学习服务器指南](env/server_guide.md)进行配置。

服务器可在实验室 WiFi 局域网环境直接连接；公网环境请联系管理员获取 Tailscale 账号。

## 维护文档

面向项目维护者和 AI 协作者的工程文档见 [docs/README.md](docs/README.md)。面向实验室成员的在线使用指南仍位于 `public/docs/`。

## 网络模型

该网站部署在 GitHub Pages 上，实时 Memos/GPU 数据由访问者的浏览器从 HTTP 内网服务中获取。用户应先连接到实验室的 Wi-Fi 或 Tailscale。如果浏览器阻止了直接的 HTTP 私有网络请求，该网站仍会保持导航和文档功能可用，并回退到内置内容。

## Network model

The site is deployed on GitHub Pages, while live Memos/GPU data is fetched by the visitor's browser from HTTP intranet services. Users should connect to the lab WiFi or Tailscale first. If a browser blocks direct HTTP private-network requests, the site keeps navigation and docs available and falls back to built-in content.
