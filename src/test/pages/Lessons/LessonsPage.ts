import { Page } from "@playwright/test";
import * as fs from "fs";
import { logger } from './../../../main/utils/logger';
import { BasePage } from "../../pages/BasePage";

function logFatal(label: string, err: unknown) {
    const message = `[FATAL] ${label}: ${
        err instanceof Error ? (err.stack || err.message) : String(err)
    }\n`;

    fs.appendFileSync('crash.log', `${new Date().toISOString()} ${message}`);
    console.error(message);
}

process.on('uncaughtException', (err) => {
    logFatal('uncaughtException', err);
});

process.on('unhandledRejection', (reason) => {
    logFatal('unhandledRejection', reason);
});

export class LessonsPage extends BasePage {

    constructor(page: Page) {
        super(page);

        page.on('crash', () => {
            fs.appendFileSync(
                'crash.log',
                `${new Date().toISOString()} [FATAL] Playwright page crashed (renderer process died)\n`
            );
            console.error('Playwright page crashed (renderer process died)');
        });

        page.on('pageerror', (err) => {
            fs.appendFileSync(
                'crash.log',
                `${new Date().toISOString()} [PAGE ERROR] ${err.message}\n`
            );
        });
    }
    private myTrainings = this.page.getByText("My Trainings", { exact: true });

    private lessonsTab = this.page.getByRole("tab", { name: "Lessons", exact: true })
        .or(this.page.getByRole("link", { name: "Lessons", exact: true }))
        .or(this.page.getByRole("button", { name: "Lessons", exact: true }));

    private learningContent = this.page.getByText("Learning Content", { exact: true });

    private addModuleButton = this.page.getByRole("button", {
        name: /Add Module/i
    });

    private saveButton = this.page.getByRole("button", {
        name: /create module/i
    });

    private moduleNameInput = this.page.locator("input.wl-modal-input");

    private descriptionInput = this.page.getByPlaceholder(
        "Brief summary of the module content"
    );

    private validationMessage = this.page.locator(
        'text=/required|mandatory/i'
    ).first();

    private createdModule(moduleName: string) {
        return this.page.getByText(moduleName, {
            exact: true
        });
    }


    async navigateToMyTrainings() {
        logger.info("Navigating to My Trainings");

        try {
            
            await this.click(this.myTrainings.first());
        } catch (error) {
            logger.error(
                `Failed to click "My Trainings". Current URL: ${this.page.url()}. ` +
                `Error: ${(error as Error).message}`
            );
            throw error;
        }

        await this.page.waitForLoadState("networkidle").catch(() => {
            logger.warn(
                "Network did not go idle after clicking My Trainings — " +
                "page may not have navigated as expected."
            );
        });
    }

    async selectCourse(courseName: string = "Manual Testing") {
        logger.info(`Selecting course: ${courseName}`);

        const course = this.page.getByText(courseName);

        try {
            await course.first().waitFor({
                state: "visible",
                timeout: 10000
            });
        } catch (error) {
            const screenshotPath = `reports/screenshots/course-not-found_${Date.now()}.png`;
            await this.page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

            logger.error(
                `Course "${courseName}" was not found on the page. ` +
                `Current URL: ${this.page.url()}. ` +
                `Screenshot saved to ${screenshotPath}`
            );

            throw error;
        }

        try {
            await this.click(course.first());
        } catch (error) {
            logger.error(
                `Failed to click course "${courseName}". ` +
                `Error: ${(error as Error).message}`
            );
            throw error;
        }
    }

    async clickLessonsTab() {
        logger.info("Clicking Lessons tab");

        try {
            await this.click(this.lessonsTab.first());
        } catch (error) {
            logger.error(
                `Failed to click Lessons tab. Current URL: ${this.page.url()}. ` +
                `Error: ${(error as Error).message}`
            );
            throw error;
        }
    }

    async isLessonsSectionDisplayed(): Promise<boolean> {
        logger.info("Checking Lessons section");

        try {
            return await this.isVisible(this.lessonsTab.first());
        } catch (error) {
            logger.error(
                `isLessonsSectionDisplayed failed. Current URL: ${this.page.url()}. ` +
                `Error: ${(error as Error).message}`
            );
            throw error;
        }
    }

    async isLearningContentDisplayed(): Promise<boolean> {
        logger.info("Checking Learning Content section");

        try {
           
            await this.learningContent.waitFor({
                state: "visible",
                timeout: 10000
            });
            return true;
        } catch (error) {
            logger.error(
                `isLearningContentDisplayed failed. Current URL: ${this.page.url()}. ` +
                `Error: ${(error as Error).message}`
            );
            return false;
        }
    }


    async clickAddModule() {
        logger.info("Clicking Add Module button");

        try {
            await this.click(this.addModuleButton.first());
        } catch (error) {
            logger.error(
                `Failed to click Add Module button. Current URL: ${this.page.url()}. ` +
                `Error: ${(error as Error).message}`
            );
            throw error;
        }
    }

    async enterValidModuleDetails(moduleName: string, description: string) {
        logger.info(`Entering module name: ${moduleName}`);

        await this.fill(this.moduleNameInput, moduleName);
        await this.fill(this.descriptionInput, description);
    }

    async clickSave() {
        logger.info("Clicking Save button");
        await this.click(this.saveButton);
    }

    

    async isCreatedModuleDisplayed(moduleName: string): Promise<boolean> {
        logger.info(`Checking whether module "${moduleName}" is displayed`);

        try {
           
            await this.createdModule(moduleName).first().waitFor({
                state: "visible",
                timeout: 10000
            });
            return true;
        } catch (error) {
            logger.error(
                `isCreatedModuleDisplayed failed for "${moduleName}". ` +
                `Current URL: ${this.page.url()}. Error: ${(error as Error).message}`
            );
            return false;
        }
    }

    async isModuleNotCreated(moduleName: string): Promise<boolean> {
        logger.info(`Verifying module "${moduleName}" was not created`);

        return !(await this.isVisible(this.createdModule(moduleName).first())
            .catch(() => false));
    }

    
    async leaveMandatoryFieldsEmpty() {
        logger.info("Leaving mandatory module fields empty");

        await this.clear(this.moduleNameInput);
        await this.clear(this.descriptionInput);
    }

    async isModuleValidationMessageDisplayed(): Promise<boolean> {
        logger.info("Checking module validation message");
        return await this.isVisible(this.validationMessage);
    }
}