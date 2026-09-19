import{Locator, Page} from "@playwright/test"
import { config } from "../../main/config/config";
import { logger } from "../../main/utils/logger";

export class BasePage{

    constructor(protected page:Page){}

    async navigate() {
        await this.page.goto(config.baseUrl);
    }
    
    async dismissCookieConsentIfPresent(): Promise<void> {
        const consentDialog = this.page.getByRole('dialog', {
            name: 'Cookie and Privacy Consent Preferences'
        });

        const isPresent = await consentDialog
            .isVisible({ timeout: 3000 })
            .catch(() => false);

        if (!isPresent) {
            return;
        }

        logger.info("Cookie consent dialog detected, dismissing it");

        const acceptButton = consentDialog.getByRole('button', {
            name: 'Accept All'
        });

        const acceptButtonVisible = await acceptButton
            .isVisible({ timeout: 2000 })
            .catch(() => false);

        if (acceptButtonVisible) {
            await acceptButton.click({ timeout: 5000 }).catch(() => {});
        }

        await consentDialog
            .waitFor({ state: 'hidden', timeout: 5000 })
            .catch(() => {});

        logger.info("Cookie consent dialog dismissed");
    }

    async click(locator:Locator) {
        await locator.click();
    }

    async fill(locator:Locator, value:string) {
        await locator.fill(value);
    }

    async getText(locator:Locator) {
        return await locator.textContent();
    }

    async check(locator:Locator) {
        await locator.check();
    }

    async clear(locator: Locator) {
        await locator.clear();
    }

    async isVisible(locator:Locator){
        return await locator.isVisible();
    }

    async isEnabled(locator:Locator) {
        return await locator.isEnabled();
    }

    async scrollIntoView(locator:Locator) {
        await locator.scrollIntoViewIfNeeded();
    }

    async selectOption(locator:Locator, value:string) {
        await locator.selectOption(value);
    }

    async uncheck(locator:Locator) {
        await locator.uncheck();
    }

     async getAllText(locator: Locator): Promise<string[]> {
        try {
            return await locator.allInnerTexts();
        } catch (error) {
            throw error;
        }
    }
}