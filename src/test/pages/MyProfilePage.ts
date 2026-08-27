import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage"

export class MyProfilePage extends BasePage {

    private saveLinksButton = this.page.locator('//button[@class = "pfd-btn-primary"]');
    private editSocialLinksButton = this.page.locator('//div[text() = "Social Links"]/following::button[1]');

    async fillSocialLink(socialMedia: string, socialLink: string) {
        logger.info(`Filling social link for ${socialMedia}: ${socialLink}`);
        const locator = this.page.locator(`//input[contains(@placeholder, "${socialMedia}")]`);
        await this.fill(locator, socialLink);
    }

    async clickSocialLink(socialMedia: string) {
        logger.info(`Clicking on ${socialMedia} social link`);
        const locator = this.page.locator(`//a[contains(@href, "${socialMedia.toLocaleLowerCase()}")]`);
        await this.click(locator);
    }

    async clickSaveLinksButton() {
        logger.info("Clicking on Save Links button in the sidebar");
        await this.click(this.saveLinksButton);
    }

    async clickEditSocialLinksButton() {
        logger.info("Clicking on Edit Social Links button in the sidebar");
        await this.click(this.editSocialLinksButton);
    }

    async isSocialLinkVisible(socialMedia: string): Promise<boolean> {
        logger.info(`Checking visibility of ${socialMedia} social link`);
        const locator = this.page.locator(`//a[contains(@href, "${socialMedia.toLocaleLowerCase()}")]`);
        return await this.isVisible(locator);
    }

    async getCurrentPageUrl() {
        logger.info("Getting current page URL");
        return this.page.url();
    }
}