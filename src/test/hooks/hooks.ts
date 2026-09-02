import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, firefox, webkit } from '@playwright/test';
import { CustomWorld } from '../../main/support/CustomWorld';
import { config } from '../../main/config/config';
import { logger } from '../../main/utils/logger';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { QuizPage } from '../pages/QuizPage';
import { DiscussionPage } from '../pages/DiscussionPage';
import { CodingPage } from '../pages/Coding/CodingPage';
import { SignUpPage } from '../pages/SignUpPage';
import { EditAssessmentPage } from '../pages/Coding/EditAssessmentPage';
import { SidebarPage } from '../pages/SidebarPage';
import { AssessmentGenerateWithAIPage } from '../pages/Coding/AssessementGenerateWithAIPage';
import { LessonsPage } from '../../test/pages/Lessons/LessonsPage';
import { MyProfilePage } from '../pages/MyProfilePage';
import { DeleteConfirmationPage } from '../pages/Coding/DeleteConfirmationPage';
import { LearnerMyCoursesPage } from '../pages/LearnerMycousePage';
import { analyzePlaywrightFailure } from '../../main/utils/ollamaClient';
import { mkdir, writeFile, readFile } from "fs/promises";

let browser: Browser;
setDefaultTimeout(30 * 1000);

BeforeAll({ timeout: 30 * 1000 }, async () => {
    try {
        if (config.browser === "chromium") {
            logger.info("Launching Chrome browser");

            browser = await chromium.launch({
                headless: config.headless,
                slowMo: config.slowMo
            });

        } else if (config.browser === "firefox") {
            logger.info("Launching Firefox browser");

            browser = await firefox.launch({
                headless: config.headless,
                slowMo: config.slowMo
            });

        } else {
            logger.info("Launching WebKit browser");

            browser = await webkit.launch({
                headless: config.headless,
                slowMo: config.slowMo
            });
        }

        logger.info(`${config.browser} browser launched successfully`);

    } catch (error) {
        logger.error(`Failed to launch ${config.browser} browser`, error);
        throw error;
    }
});

Before(async function (this: CustomWorld, scenario) {
    
    this.browser = browser;
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    this.loginPage = new LoginPage(this.page);
    this.dashboardPage = new DashboardPage(this.page);
    this.quizPage = new QuizPage(this.page);
    this.discussionPage = new DiscussionPage(this.page);
    this.codingPage = new CodingPage(this.page);
    this.signUpPage = new SignUpPage(this.page);
    this.assessmentPage = new AssessmentGenerateWithAIPage(this.page);
    this.lessonsPage = new LessonsPage(this.page);
    this.editAssessmentPage = new EditAssessmentPage(this.page);
    this.sidebarPage = new SidebarPage(this.page);
    this.assessmentPage = new AssessmentGenerateWithAIPage(this.page);
    this.lessonsPage = new LessonsPage(this.page);
    this.learnerMyCoursesPage = new LearnerMyCoursesPage(this.page);
    this.myProfilePage = new MyProfilePage(this.page);
    this.deleteConfirmationPage = new DeleteConfirmationPage(this.page);
});


function extractSourceLocation(
    failureMessage: string
): {
    filePath: string;
    line: number;
    column: number;
} | null {

    const regex =
        /([A-Za-z]:\\[^()\r\n]*?\.ts):(\d+):(\d+)/g;

    const matches =
        [...failureMessage.matchAll(regex)];

    if (matches.length === 0) {
        return null;
    }

    const userSource =
        matches.find(
            match =>
                !match[1].includes("node_modules")
        );

    if (!userSource) {
        return null;
    }

    return {
        filePath: userSource[1],
        line: Number(userSource[2]),
        column: Number(userSource[3])
    };
}


async function getSourceCodeAroundFailure(filePath: string,line: number): Promise<string> {
    try {
        const source = await readFile(filePath, "utf-8");
        const lines = source.split(/\r?\n/);
        const start = Math.max(0, line - 11);
        const end = Math.min(lines.length, line + 10);
        return lines
            .slice(start, end)
            .map(
                (content, index) =>
                    `${start + index + 1}: ${content}`
            )
            .join("\n");
    } catch (error) {
        return `
Unable to read source file.
File: ${filePath}
Line: ${line}
Error: ${String(error)}
`;}
}

After(async function (this: CustomWorld, scenario) {

    try {
        if (scenario.result?.status === "FAILED") {

            const scenarioName =
                scenario.pickle.name;

            const failureMessage =
                scenario.result.message ||
                "No failure message available.";


            logger.error(
                `Scenario failed: ${scenarioName}`
            );

            logger.error(
                `Failure message: ${failureMessage}`
            );

            try {

                const screenshot =
                    await this.page.screenshot({
                        fullPage: true
                    });

                this.attach(
                    screenshot,
                    "image/png"
                );

            } catch (screenshotError) {

                logger.error(
                    `Screenshot failed: ${String(screenshotError)}`
                );
            }
            let currentUrl = "";
            let pageTitle = "";

            try {
                currentUrl = this.page.url();
                pageTitle = await this.page.title();
            } catch {
                currentUrl = "Unable to read URL";
                pageTitle = "Unable to read page title";
            }
            
            try {
    const sourceLocation = extractSourceLocation(failureMessage);
    let sourceCode = "Exact source code could not be identified.";
    if (sourceLocation) {
        logger.info(
            `Failure source detected: ${sourceLocation.filePath}:${sourceLocation.line}:${sourceLocation.column}`
        );
        sourceCode =
            await getSourceCodeAroundFailure(
                sourceLocation.filePath,
                sourceLocation.line
            );
    }
    logger.info("Sending failure information to Ollama...");
    const analysis =
        await analyzePlaywrightFailure(
            scenarioName,
            failureMessage,
            `
CURRENT URL:
${currentUrl}

PAGE TITLE:
${pageTitle}

SCENARIO:
${scenarioName}

FAILURE:
${failureMessage}

FAILURE SOURCE:
${sourceLocation
    ? `${sourceLocation.filePath}:${sourceLocation.line}:${sourceLocation.column}`
    : "Not identified"}

ACTUAL SOURCE CODE AROUND FAILURE:
${sourceCode}
`
        );
//terminal output

                console.log("");
                console.log("======================================================")
                console.log("OLLAMA AI FAILURE ANALYSIS");
                console.log("======================================================")
                console.log(analysis);
                console.log("======================================================")
                console.log("");
//report
              const analysisDirectory = "reports/ollama-analysis";

await mkdir(analysisDirectory, { recursive: true });

const safeScenarioName = scenario.pickle.name
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .substring(0, 100);

const analysisPath =
    `${analysisDirectory}/${safeScenarioName}_${Date.now()}.txt`;

await writeFile(analysisPath, analysis, "utf-8");

logger.info(`Ollama analysis saved to: ${analysisPath}`);

            } catch (ollamaError) {
                logger.error(
                    `Ollama analysis failed: ${String(ollamaError)}`
                );

                console.log(
                    "Ollama analysis could not be completed."
                );
            }
        }

    } catch (error) {

        logger.error(
            `Error during failure analysis: ${String(error)}`
        );

    } finally {
        try {

            if (this.page) {
                await this.page.close();
            }

            if (this.context) {
                await this.context.close();
            }

        } catch (cleanupError) {

            logger.error(
                `Cleanup failed: ${String(cleanupError)}`
            );
        }
    }
});


AfterAll(async () => {
    await browser.close();
});