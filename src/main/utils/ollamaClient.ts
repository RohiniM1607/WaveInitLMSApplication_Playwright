import { readFile } from "fs/promises";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "qwen2.5-coder:7b";

interface OllamaResponse {
    response: string;
}

async function readSourceFile(filePath: string): Promise<string> {
    try {
        return await readFile(filePath, "utf-8");
    } catch (error) {
        return `Unable to read file: ${filePath}\nError: ${String(error)}`;
    }
}

export async function askOllama(prompt: string): Promise<string> {

    try {

        const response = await fetch(OLLAMA_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(
                `Ollama API request failed: ${response.status} ${response.statusText}`
            );
        }

        const data =
            await response.json() as OllamaResponse;

        return (
            data.response?.trim() ||
            "Ollama returned an empty response."
        );

    } catch (error) {

        throw new Error(
            `Ollama request failed: ${String(error)}`
        );
    }
}

export async function analyzePlaywrightFailure(
    scenarioName: string,
    failureMessage: string,
    observedLogs: string = ""
): Promise<string> {

    const prompt = `
You are an expert Playwright, TypeScript and Cucumber test automation engineer.

Analyze the failed automated test using ONLY the information supplied below.

Do not give generic testing advice.
Do not invent selectors, locators, methods, files, application behavior, or code.

==============================
FAILED SCENARIO
==============================

${scenarioName}

==============================
FAILURE MESSAGE
==============================

${failureMessage}

==============================
OBSERVED LOGS
==============================

${observedLogs || "No additional logs were provided."}

==============================
TASK
==============================

Identify the most likely actual root cause from the available information.

Return exactly:

ROOT CAUSE:
Explain the most likely root cause.

FAILURE TYPE:
Choose one:
- Locator
- Synchronization/Timing
- Assertion
- Navigation
- Test Data
- Application State
- Page Object
- Step Definition
- Other

EXACT LOCATION:
Give the location only if it can be determined from the supplied information.

CURRENT PROBLEMATIC CODE:
Use ONLY the actual source code supplied under
"ACTUAL SOURCE CODE AROUND FAILURE".

CORRECTED CODE:
Provide corrected code only when the supplied source code
clearly shows the problem.

IMPORTANT:
Do not invent selectors, locators, variables, methods,
classes, assertions, or source code.

The source code supplied in the prompt is the only source
code you are allowed to analyze.

WHY THIS FIX WORKS:
Explain why the proposed fix solves the failure.

OTHER IMPACTED TESTS:
Mention possible impact on other tests only when it can be reasonably determined.

IMPORTANT:
1. Do not invent application behavior.
2. Do not invent source code.
3. Do not create selectors that were not supplied.
4. If exact source code is unavailable, say:
   "Exact source code is not available in the supplied information."
5. If the root cause cannot be determined, clearly state what information is missing.
`;

    return await askOllama(prompt);
}