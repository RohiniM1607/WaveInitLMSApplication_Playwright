export interface ParsedToolCall {
    function: {
        name: string;
        arguments: Record<string, unknown>;
    };
}


export function parseToolCallFromText(
    content: string
): ParsedToolCall | null {

    if (!content) {
        return null;
    }

    try {

        const parsed = JSON.parse(content);

        if (
            parsed.name &&
            typeof parsed.name === 'string'
        ) {

            return {
                function: {
                    name: parsed.name,

                    arguments:
                        parsed.arguments ?? {}
                }
            };
        }

        return null;

    } catch {

        return null;
    }
}