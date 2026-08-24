import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium, Browser, firefox, webkit } from '@playwright/test';
import { CustomWorld } from '../../main/support/CustomWorld';
import { config } from '../../main/config/config';
import { logger } from '../../main/utils/logger';

let browser: Browser;
BeforeAll(async () => {
    if (config.browser === "chromium") {
        logger.info("Launching chrome browser");
        browser = await chromium.launch({ headless: config.headless, slowMo: config.slowMo });
        logger.info("Chrome browser launched");
    }
    else if (config.browser === "firefox") {
        logger.info("Launching firefox browser");
        browser = await firefox.launch({ headless: config.headless, slowMo: config.slowMo });
        logger.info("Firefox browser launched");
    }
    else {
        logger.info("Launching safari browser");
        browser = await webkit.launch({ headless: config.headless, slowMo: config.slowMo });
        logger.info("Safari browser launched");
    }
});

Before(async function (this: CustomWorld, scenario) {
    this.browser = browser;
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, scenario) {
    if (scenario.result?.status === "FAILED") {
        if (this.page) {
            await this.page.screenshot({ path: `reports/screenshots/${scenario.pickle.name}_${Date.now()}.png`, fullPage: true });
        }
    }
    if (this.page) {
        await this.page.close();
    }
    if (this.context) {
        await this.context.close();
    }
});

AfterAll(async () => {
    await browser.close();
});