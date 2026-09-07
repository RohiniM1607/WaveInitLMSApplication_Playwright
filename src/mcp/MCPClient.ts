import { Client } from '@modelcontextprotocol/client';

import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';


export class PlaywrightMCPClient {

    private client: Client;

    private connected = false;


    constructor() {

        this.client = new Client({
            name: 'playwright-ai-agent',
            version: '1.0.0'
        });
    }


    async connect(): Promise<void> {

        if (this.connected) {
            return;
        }

        const transport =
            new StdioClientTransport({
                command: 'npx',
                args: [
                    'ts-node',
                    'src/mcp/PlaywrightMCPServer.ts'
                ]
            });

        await this.client.connect(transport);

        this.connected = true;

        console.log('Connected to Playwright MCP Server');
    }


    async getTools() {
        const result = await this.client.listTools();
        return result.tools;
    }


    async callTool( name: string, args: Record<string, unknown>) {

        return await this.client.callTool({name,arguments: args});
    }


    async close(): Promise<void> {

        if (!this.connected) {
            return;
        }

        await this.client.close();

        this.connected = false;
    }
}