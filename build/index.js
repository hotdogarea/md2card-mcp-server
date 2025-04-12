#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
class MD2CardServer {
    server;
    API_KEY;
    constructor() {
        this.server = new Server({
            name: 'md2card-server',
            version: '0.1.0'
        }, {
            capabilities: {
                tools: {}
            }
        });
        this.API_KEY = process.env.MD2CARD_API_KEY || '';
        if (!this.API_KEY) {
            throw new Error('MD2CARD_API_KEY未配置');
        }
        this.setupToolHandlers();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, () => ({
            tools: [{
                    name: 'convert_markdown',
                    description: '转换Markdown为卡片图片',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            markdown: { type: 'string', description: 'Markdown内容' },
                            width: { type: 'number', default: 440 },
                            height: { type: 'number', default: 586 },
                            theme: { type: 'string', default: 'apple-notes' },
                            splitMode: { type: 'string', default: 'noSplit' },
                            mdxMode: { type: 'boolean', default: false },
                            overHiddenMode: { type: 'boolean', default: false }
                        },
                        required: ['markdown']
                    }
                }]
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                if (request.params.name !== 'convert_markdown') {
                    throw new McpError(ErrorCode.MethodNotFound, '未知工具');
                }
                // 参数映射处理
                const { markdown, width = 440, height = 586, theme = 'apple-notes', splitMode = 'noSplit', mdxMode = false, overHiddenMode = false } = request.params.arguments;
                // 主题映射
                const themeMap = {
                    '苹果备忘录': 'apple-notes',
                    '波普艺术': 'pop-art',
                    '艺术装饰': 'art-deco',
                    '玻璃拟态': 'glassmorphism',
                    '温暖柔和': 'warm',
                    '简约高级灰': 'minimal',
                    '梦幻渐变': 'dreamy',
                    '清新自然': 'nature',
                    '紫色小红书': 'xiaohongshu',
                    '笔记本': 'notebook',
                    '暗黑科技': 'darktech',
                    '复古打字机': 'typewriter',
                    '水彩艺术': 'watercolor',
                    '中国传统': 'traditional-chinese',
                    '儿童童话': 'fairytale',
                    '商务简报': 'business',
                    '日本杂志': 'japanese-magazine',
                    '极简黑白': 'minimalist',
                    '赛博朋克': 'cyber'
                };
                // 尺寸预设映射
                const sizeMap = {
                    '小红书': { width: 750, height: 1000 }, // 3:4比例
                    '正方形': { width: 500, height: 500 },
                    '手机海报': { width: 360, height: 640 } // 9:16比例
                };
                // 拆分模式映射
                const splitModeMap = {
                    '自动拆分': 'autoSplit',
                    '横线拆分': 'hrSplit',
                    '不拆分': 'noSplit'
                };
                // 处理参数
                const finalTheme = themeMap[theme] || theme;
                let finalWidth = width;
                let finalHeight = height;
                const finalSplitMode = splitModeMap[splitMode] || splitMode;
                // 只处理width预设，height保持原值或按比例计算
                if (typeof width === 'string' && sizeMap[width]) {
                    finalWidth = sizeMap[width].width;
                    // 如果height也是字符串预设，则忽略
                    if (typeof height !== 'string') {
                        finalHeight = Math.round(finalWidth * sizeMap[width].height / sizeMap[width].width);
                    }
                }
                // 严格按照API要求的格式构造请求体
                const requestBody = {
                    markdown: markdown,
                    theme: finalTheme,
                    width: finalWidth,
                    height: finalHeight,
                    splitMode: finalSplitMode,
                    mdxMode: mdxMode,
                    overHiddenMode: overHiddenMode
                };
                const response = await axios.post('https://agent.mathmind.cn/minimalist/api/image/generate', requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.API_KEY
                    }
                });
                if (!response.data) {
                    throw new McpError(ErrorCode.InternalError, '无效的API响应');
                }
                // 直接返回API原始响应
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                status: 'success',
                                data: response.data
                            })
                        }]
                };
            }
            catch (error) {
                console.error('转换失败:', error);
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                error: true,
                                message: error instanceof Error ? error.message : '未知错误'
                            })
                        }],
                    isError: true
                };
            }
        });
    }
    async run() {
        try {
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            console.log('MD2Card服务器已启动');
        }
        catch (error) {
            console.error('服务器启动失败:', error);
            process.exit(1);
        }
    }
}
// 启动服务器
new MD2CardServer().run().catch(err => {
    console.error('服务器运行错误:', err);
    process.exit(1);
});
