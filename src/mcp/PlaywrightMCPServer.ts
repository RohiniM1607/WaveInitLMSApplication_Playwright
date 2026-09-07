import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const PROJECT_ROOT = process.cwd();

const server = new McpServer({
    name: 'playwright-automation-mcp',
    version: '1.0.0'
});


function getSafeProjectPath(requestedPath: string): string {

    const resolvedPath = path.resolve( PROJECT_ROOT, requestedPath);

    const relativePath = path.relative( PROJECT_ROOT, resolvedPath );

    if (
        relativePath.startsWith('..') ||
        path.isAbsolute(relativePath)
    ) {
        throw new Error(
            'Access outside the project directory is not allowed.'
        );
    }

    return resolvedPath;
}


/**
 * TOOL 1
 * Get project structure
 */
server.registerTool(
    'get_project_structure',
    {
        description:
            'Get the directory structure of the Playwright automation project.',

        inputSchema: z.object({})
    },

    async () => {

        async function getStructure(
            directory: string,
            level = 0
        ): Promise<string> {

            const entries = await fs.readdir(
                directory,
                {
                    withFileTypes: true
                }
            );

            let result = '';

            for (const entry of entries) {

                if (
                    entry.name === 'node_modules' ||
                    entry.name === '.git' ||
                    entry.name === 'allure-results'
                ) {
                    continue;
                }

                result += `${'  '.repeat(level)}${entry.name}\n`;

                if (entry.isDirectory()) {

                    const fullPath = path.join(
                        directory,
                        entry.name
                    );

                    result += await getStructure(
                        fullPath,
                        level + 1
                    );
                }
            }

            return result;
        }

        const structure = await getStructure(
            PROJECT_ROOT
        );

        return {
            content: [
                {
                    type: 'text',
                    text: structure
                }
            ]
        };
    }
);


/**
 * TOOL 2
 * Read project file
 */
server.registerTool(
    'read_project_file',
    {
        description:
            'Read a file from the Playwright automation project.',

        inputSchema: z.object({
            filePath: z.string()
        })
    },

    async ({ filePath }) => {

        const fullPath =
            getSafeProjectPath(filePath);

        const content = await fs.readFile(
            fullPath,
            'utf-8'
        );

        return {
            content: [
                {
                    type: 'text',
                    text: content
                }
            ]
        };
    }
);


/**
 * TOOL 3
 * Create project file
 */
server.registerTool(
    'create_project_file',
    {
        description:
            'Create a new file inside the Playwright automation project.',

        inputSchema: z.object({
            filePath: z.string(),
            content: z.string()
        })
    },

    async ({ filePath, content }) => {

        const fullPath =
            getSafeProjectPath(filePath);

        const exists = await fs
            .access(fullPath)
            .then(() => true)
            .catch(() => false);

        if (exists) {

            return {
                content: [
                    {
                        type: 'text',
                        text:
                            `File already exists: ${filePath}. ` +
                            `Use update_project_file instead.`
                    }
                ],
                isError: true
            };
        }

        await fs.mkdir(
            path.dirname(fullPath),
            {
                recursive: true
            }
        );

        await fs.writeFile(
            fullPath,
            content,
            'utf-8'
        );

        return {
            content: [
                {
                    type: 'text',
                    text:
                        `File created successfully: ${filePath}`
                }
            ]
        };
    }
);


/**
 * TOOL 4
 * Update existing file
 */
server.registerTool(
    'update_project_file',
    {
        description:
            'Replace the complete content of an existing project file.',

        inputSchema: z.object({
            filePath: z.string(),
            content: z.string()
        })
    },

    async ({ filePath, content }) => {

        const fullPath =
            getSafeProjectPath(filePath);

        const exists = await fs
            .access(fullPath)
            .then(() => true)
            .catch(() => false);

        if (!exists) {

            return {
                content: [
                    {
                        type: 'text',
                        text:
                            `File does not exist: ${filePath}`
                    }
                ],
                isError: true
            };
        }

        await fs.writeFile(
            fullPath,
            content,
            'utf-8'
        );

        return {
            content: [
                {
                    type: 'text',
                    text:
                        `File updated successfully: ${filePath}`
                }
            ]
        };
    }
);


/**
 * TOOL 5
 * Run approved test commands only
 */
server.registerTool(
    'run_tests',
    {
        description:
            'Run an approved Playwright/Cucumber test command.',

        inputSchema: z.object({
            command: z.enum([
                'npm test',
                'npm run vignesh',
                'npm run parallel',
                'npm run test:failed'
            ])
        })
    },

    async ({ command }) => {

        const commandMap: Record<
            string,
            {
                file: string;
                args: string[];
            }
        > = {

            'npm test': {
                file: 'npm',
                args: ['test']
            },

            'npm run vignesh': {
                file: 'npm',
                args: ['run', 'vignesh']
            },

            'npm run parallel': {
                file: 'npm',
                args: ['run', 'parallel']
            },

            'npm run test:failed': {
                file: 'npm',
                args: ['run', 'test:failed']
            }
        };

        const selectedCommand =
            commandMap[command];

        const result =
            await execFileAsync(
                selectedCommand.file,
                selectedCommand.args,
                {
                    cwd: PROJECT_ROOT,
                    timeout: 300000
                }
            );

        return {
            content: [
                {
                    type: 'text',
                    text: `
STDOUT:

${result.stdout}

STDERR:

${result.stderr}
`
                }
            ]
        };
    }
);


async function startServer() {

    const transport =
        new StdioServerTransport();

    await server.connect(transport);

    console.error('Playwright MCP Server is running...');
}


startServer().catch((error) => {

    console.error(
        'Failed to start MCP Server:',
        error
    );

    process.exit(1);
});