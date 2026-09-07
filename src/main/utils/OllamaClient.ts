import axios from 'axios';

export interface OllamaToolCall {
    id?: string;

    type?: 'function';

    function: {
        index?: number;
        name: string;
        arguments: Record<string, any>;
    };
}

export interface OllamaMessage {
    role:
        | 'system'
        | 'user'
        | 'assistant'
        | 'tool';

    content: string;

    tool_calls?: OllamaToolCall[];
}

export class OllamaClient {

    private readonly baseUrl =
        'http://localhost:11434';

    private readonly model =
        'qwen3:4b';

    async chat(
        messages: OllamaMessage[],
        tools?: unknown[]
    ) {

        try {

            const response = await axios.post(
                `${this.baseUrl}/api/chat`,
                {
                    model: this.model,
                    messages: messages,
                    tools: tools,
                    think: false,
                
                options: {
                    num_predict: 512
                },
                    stream: false
                },
                {
                    timeout: 600000
                }
            );

            return response.data;

        } catch (error) {

            if (axios.isAxiosError(error)) {

                if (
                    error.code === 'ECONNREFUSED'
                ) {

                    throw new Error(
                        'Unable to connect to Ollama.'
                    );
                }

                if (
                    error.code === 'ECONNABORTED'
                ) {

                    throw new Error(
                        'Ollama response timed out.'
                    );
                }
            }

            throw error;
        }
    }
}