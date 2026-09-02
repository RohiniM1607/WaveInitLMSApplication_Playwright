import { readFile } from "fs/promises";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "qwen2.5-coder:7b";
const OLLAMA_TIMEOUT = 30000;

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

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, OLLAMA_TIMEOUT);

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
            }),

            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(
                `Ollama API request failed: ${response.status} ${response.statusText}`
            );
        }

        const data =
            await response.json() as OllamaResponse;

        return data.response?.trim() || "Ollama returned an empty response.";

    } finally {

        clearTimeout(timeout);
    }
}


/**
 * Analyze a failed Playwright/Cucumber scenario
 * using the actual Step Definition and Page Object source code.
 */
export async function analyzePlaywrightFailure(
    scenarioName: string,
    failureMessage: string,
    stepFilePath: string,
    pageFilePath: string,
    observedLogs: string = ""
): Promise<string> {

    const stepCode =
        await readSourceFile(stepFilePath);

    const pageCode =
        await readSourceFile(pageFilePath);

    const prompt = `
You are an expert Playwright, TypeScript and Cucumber test automation engineer.

Your job is to DEBUG the failed automated test, not to give generic testing advice.

Analyze the actual failure using the supplied error, logs, Step Definition and Page Object code.

==============================
FAILED SCENARIO
==============================

${scenarioName}

==============================
FAILURE MESSAGE
==============================

${failureMessage}

==============================
OBSERVED TEST LOGS
==============================

${observedLogs || "No additional logs were provided."}

==============================
STEP DEFINITION CODE
==============================

File:
${stepFilePath}

${stepCode}

==============================
PAGE OBJECT CODE
==============================

File:
${pageFilePath}

${pageCode}

==============================
YOUR TASK
==============================

Find the most likely ACTUAL root cause from the supplied code.

Do NOT give generic answers such as:

- Check the locator
- Check timing
- Check the browser
- Add a wait

unless the supplied code specifically proves that this is the problem.

You must identify the exact method and code responsible when possible.

Return the answer using exactly this structure:

ROOT CAUSE:
Explain the actual problem based on the supplied code and failure.

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
Give the file, method and relevant code that is causing the problem.

CURRENT PROBLEMATIC CODE:
Show only the relevant existing code.

CORRECTED CODE:
Provide the exact replacement code.

WHY THIS FIX WORKS:
Explain why the corrected code solves this specific failure.

OTHER IMPACTED TESTS:
Mention whether this change could affect other tests.

IMPORTANT:
Do not invent application behavior that is not supported by the supplied information.
If the information is insufficient, clearly state what is missing.
`;

    return await askOllama(prompt);
}