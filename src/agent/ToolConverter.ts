export function convertMCPToolsToOllamaTools(
    mcpTools: any[]
) {

    return mcpTools.map((tool) => ({

        type: 'function',

        function: {

            name: tool.name,

            description: tool.description,

            parameters: tool.inputSchema
        }
    }));
}