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
import { AssessmentPage } from '../pages/Coding/AssessmentPage';

setDefaultTimeout(15000);

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
    this.assessmentPage = new AssessmentPage(this.page);
});

After(async function (this: CustomWorld, scenario) {

    if (scenario.result?.status === "FAILED") {

        const screenshot = await this.page.screenshot({
            fullPage: true
        }); 

        this.attach(screenshot,"image/png");

        const screenshotPath =
            `reports/screenshots/${scenario.pickle.name}_${Date.now()}.png`;

        await this.page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

    }

    await this.page.close();
    await this.context.close();
});

AfterAll(async () => {
    await browser.close();
});