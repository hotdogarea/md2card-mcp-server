# MD2Card MCP 服务器

将Markdown文档转换为可视化图片卡片的MCP服务器

## 功能特性
- 支持19种主题样式
- 智能尺寸适配
- 三种内容拆分模式
- 通过MCP协议提供标准化接口


### 客户端配置
在MCP客户端配置文件中添加以下内容：

```json
{
  "md2card-server": {
    "command": "node",
    "args": ["path/to/build/index.js"],
    "env": {
      "MD2CARD_API_KEY": "您的API密钥"
    }
  }
}
```
