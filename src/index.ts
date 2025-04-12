#!/usr/bin/env node
import fs from 'fs'; 
import path from 'path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode, 
  ListToolsRequestSchema,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosError } from 'axios';

class MD2CardServer {
  private server: Server;
  private API_KEY: string;

  constructor() {
    this.server = new Server(
      {
        name: 'md2card-server',
        version: '0.1.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.API_KEY = process.env.MD2CARD_API_KEY || '';
    if (!this.API_KEY) {
      throw new Error('MD2CARD_API_KEY未配置');
    }

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
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

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      try {
        if (request.params.name !== 'convert_markdown') {
          throw new McpError(ErrorCode.MethodNotFound, '未知工具');
        }

        const { markdown, width = 440, height = 586, theme = 'apple-notes', 
               splitMode = 'noSplit', mdxMode = false, overHiddenMode = false } = request.params.arguments;

        const response = await axios.post(
          'https://agent.mathmind.cn/minimalist/api/image/generate',
          { markdown, width, height, theme, splitMode, mdxMode, overHiddenMode },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.API_KEY
            }
          }
        );

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
      } catch (error) {
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
    } catch (error) {
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
