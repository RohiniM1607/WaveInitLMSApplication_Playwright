import {
    OllamaClient,
    OllamaMessage
} from '../main/utils/OllamaClient';

import {
    PlaywrightMCPClient
} from '../mcp/MCPClient';

import {
    convertMCPToolsToOllamaTools
} from './ToolConverter';

import {
    parseToolCallFromText,
    ParsedToolCall
} from './ToolCallParser';


export class PlaywrightAgent {

    private readonly ollama =
        new OllamaClient();

    private readonly mcp =
        new PlaywrightMCPClient();


    async run(
        userRequest: string
    ): Promise<string> {

        try {

            /*
             * ----------------------------------------
             * CONNECT TO PLAYWRIGHT MCP
             * ----------------------------------------
             */

            await this.mcp.connect();


            /*
             * ----------------------------------------
             * GET MCP TOOLS
             * ----------------------------------------
             */

            const mcpTools =
                await this.mcp.getTools();


            /*
             * ----------------------------------------
             * CONVERT MCP TO OLLAMA FORMAT
             * ----------------------------------------
             */

            const ollamaTools =
                convertMCPToolsToOllamaTools(
                    mcpTools
                );


            /*
             * ----------------------------------------
             * SYSTEM PROMPT
             * ----------------------------------------
             */

            const systemPrompt = `

You are an AI agent working with an EXISTING
Playwright automation project.

The project uses:

- Playwright
- TypeScript
- Cucumber BDD
- Page Object Model

You have tools that provide REAL information
from the project.

CRITICAL RULES:

1. NEVER invent project files or folders.

2. For questions about project structure,
   you MUST call get_project_structure.

3. For questions about an existing file,
   you MUST call read_project_file.

4. Do not provide project-specific answers
   until you have inspected the required
   information using the available tools.

5. After receiving a tool result,
   analyze the REAL information returned.

6. Do not repeat a tool call unless necessary.

7. If you need more information,
   use the appropriate tool.

8. When you have enough information,
   provide the final answer in normal text.

IMPORTANT:

Use the available tools to obtain real
project information.

Do NOT invent information.

`;


            /*
             * ----------------------------------------
             * INITIAL CONVERSATION
             * ----------------------------------------
             */

            const messages: OllamaMessage[] = [

                {
                    role: 'system',

                    content:
                        systemPrompt
                },

                {
                    role: 'user',

                    content:
                        userRequest
                }

            ];


            /*
             * ----------------------------------------
             * MAX AGENT ITERATIONS
             * ----------------------------------------
             */

            const MAX_ITERATIONS = 10;


            /*
             * ----------------------------------------
             * AGENT LOOP
             * ----------------------------------------
             */

            for (
                let iteration = 0;
                iteration < MAX_ITERATIONS;
                iteration++
            ) {

                console.log(
                    `\nAgent iteration ${iteration + 1}...`
                );


                /*
                 * ------------------------------------
                 * ASK OLLAMA
                 * ------------------------------------
                 */

                const response =
                    await this.ollama.chat(
                        messages,
                        ollamaTools
                    );


                /*
                 * ------------------------------------
                 * DEBUG RESPONSE
                 * ------------------------------------
                 */

                console.log(
                    '\nRAW OLLAMA RESPONSE:\n'
                );

                console.log(
                    JSON.stringify(
                        response,
                        null,
                        2
                    )
                );


                /*
                 * ------------------------------------
                 * GET ASSISTANT MESSAGE
                 * ------------------------------------
                 */

                const assistantMessage =
                    response.message;


                /*
                 * ------------------------------------
                 * GET STRUCTURED TOOL CALLS
                 * ------------------------------------
                 */

                let toolCalls:
                    | ParsedToolCall[]
                    | undefined =
                    assistantMessage.tool_calls;


                /*
                 * ------------------------------------
                 * FALLBACK TOOL CALL PARSER
                 *
                 * This is only needed if the model
                 * returns a tool call as text.
                 * ------------------------------------
                 */

                if (
                    (!toolCalls ||
                        toolCalls.length === 0) &&
                    assistantMessage.content
                ) {

                    const parsedToolCall =
                        parseToolCallFromText(
                            assistantMessage.content
                        );


                    if (parsedToolCall) {

                        console.log(
                            '\nTool call detected from text response.'
                        );


                        toolCalls = [
                            parsedToolCall
                        ];
                    }
                }


                /*
                 * ------------------------------------
                 * NO TOOL CALL
                 *
                 * This means the model considers
                 * the task complete.
                 * ------------------------------------
                 */

                if (
                    !toolCalls ||
                    toolCalls.length === 0
                ) {

                    console.log(
                        '\nNo tool call detected.'
                    );

                    console.log(
                        'Agent has generated the final response.'
                    );


                    return (
                        assistantMessage.content ||
                        'Agent completed the task.'
                    );
                }


                /*
                 * ------------------------------------
                 * IMPORTANT:
                 *
                 * PRESERVE THE ASSISTANT MESSAGE
                 * THAT CONTAINS THE TOOL CALL.
                 *
                 * This is required so Ollama sees
                 * the correct conversation history.
                 * ------------------------------------
                 */

                messages.push({

                    role: 'assistant',

                    content:
                        assistantMessage.content || '',

                    tool_calls:
                        assistantMessage.tool_calls

                });


                /*
                 * ------------------------------------
                 * EXECUTE EACH TOOL CALL
                 * ------------------------------------
                 */

                for (
                    const toolCall
                    of toolCalls
                ) {


                    /*
                     * -------------------------------
                     * TOOL NAME
                     * -------------------------------
                     */

                    const toolName =
                        toolCall.function.name;


                    /*
                     * -------------------------------
                     * TOOL ARGUMENTS
                     * -------------------------------
                     */

                    const toolArguments =
                        toolCall.function.arguments || {};


                    console.log(
                        `\nAgent requested tool: ${toolName}`
                    );


                    console.log(
                        'Arguments:',
                        toolArguments
                    );


                    /*
                     * -------------------------------
                     * CALL MCP TOOL
                     * -------------------------------
                     */

                    const toolResult =
                        await this.mcp.callTool(
                            toolName,
                            toolArguments
                        );


                    /*
                     * -------------------------------
                     * EXTRACT TOOL TEXT
                     * -------------------------------
                     */

                    const toolText =
                        toolResult.content
                            .map(
                                (item: any) => {

                                    if (
                                        item.type === 'text'
                                    ) {

                                        return item.text;
                                    }

                                    return '';
                                }
                            )
                            .join('\n');


                    /*
                     * -------------------------------
                     * LOG TOOL RESULT
                     * -------------------------------
                     */

                    console.log(
                        '\nTOOL RESULT RECEIVED:\n'
                    );


                    console.log(
                        toolText
                    );


                    /*
                     * --------------------------------
                     * IMPORTANT:
                     *
                     * SEND TOOL RESULT AS `tool`
                     * MESSAGE.
                     *
                     * DO NOT SEND IT AS `user`.
                     * --------------------------------
                     */

                    messages.push({

                        role: 'tool',

                        content:
                            toolText

                    });

                }

                /*
                 * ------------------------------------
                 * LOOP CONTINUES
                 *
                 * Ollama now receives:
                 *
                 * assistant -> tool call
                 * tool     -> tool result
                 *
                 * and decides what to do next.
                 * ------------------------------------
                 */

            }


            /*
             * ----------------------------------------
             * MAX ITERATIONS REACHED
             * ----------------------------------------
             */

            return `
Agent stopped because it reached the maximum
number of allowed iterations.
`;

        } finally {

            /*
             * ----------------------------------------
             * CLOSE MCP CONNECTION
             * ----------------------------------------
             */

            await this.mcp.close();
        }
    }
}