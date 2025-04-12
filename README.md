# MD2Card MCP 服务器

将Markdown文档转换为可视化图片卡片的MCP服务器

![image](https://github.com/user-attachments/assets/8300606a-b47d-4d75-8ebf-4859cbe0d7e4)

## 在cline中调用
![image](https://github.com/user-attachments/assets/b5714383-c200-4cfd-929d-9ba3f077740d)

![image](https://github.com/user-attachments/assets/2bae6e2f-a452-4271-8c8b-dcc249c18810)

![1744488841278_buwmnh](https://github.com/user-attachments/assets/9f144607-ff07-4a4c-9784-9b1405a598ad)


## SetUp
clone项目到本地，找到index.js路径替换到客户端mcp配置文件中

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
密钥申请地址：https://admin.mathmind.cn/login?referralCode=REF43267489
