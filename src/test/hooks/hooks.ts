import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, firefox, webkit } from '@playwright/test';
import { CustomWorld } from '../../main/support/CustomWorld';
import { config } from '../../main/config/config';
import { logger } from '../../main/utils/logger';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { QuizPage } from '../pages/QuizPage';
import { DiscussionPage } from '../pages/LearnerMyCourse/DiscussionPage';
import { CodingPage } from '../pages/Coding/CodingPage';
import { SignUpPage } from '../pages/SignUpPage';
import { EditAssessmentPage } from '../pages/Coding/EditAssessmentPage';
import { SidebarPage } from '../pages/SidebarPage';
import { AssessmentGenerateWithAIPage } from '../pages/Coding/AssessementGenerateWithAIPage';
import { LessonsPage } from '../../test/pages/Lessons/LessonsPage';
import { MyProfilePage } from '../pages/MyProfilePage';
import { DeleteConfirmationPage } from '../pages/Coding/DeleteConfirmationPage';
import { LearnerMyCoursesPage } from '../pages/LearnerMyCourse/LearnerMycousePage';
import { TrainingProgramPage } from '../../test/pages/AdminTrainingPragram/TrainingProgramPage';
import { AddTrainingProgramPage } from '../../test/pages/AdminTrainingPragram/AddTrainingProgramPage';

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
    this.trainingProgramPage = new TrainingProgramPage(this.page);
    this.addTrainingProgramPage = new AddTrainingProgramPage(this.page);
});



After(async function (this: CustomWorld, scenario) {
    try {
        if (scenario.result?.status === "FAILED") {
            const scenarioName = scenario.pickle.name;
            const failureMessage =
                scenario.result.message || "No failure message available.";

            logger.error(`Scenario failed: ${scenarioName}`);
            logger.error(`Failure message: ${failureMessage}`);

            try {
                const screenshot = await this.page.screenshot({
                    fullPage: true
                });

                this.attach(screenshot, "image/png");
            } catch (screenshotError) {
                logger.error(
                    `Screenshot failed: ${String(screenshotError)}`
                );
            }
        }
    } catch (error) {
        logger.error(
            `Error during failure handling: ${String(error)}`
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