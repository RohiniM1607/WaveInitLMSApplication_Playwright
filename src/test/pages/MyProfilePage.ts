import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage"

export class MyProfilePage extends BasePage {

    private newPage: any;
    private saveLinksButton = this.page.locator('//button[@class = "pfd-btn-primary"]');
    private editSocialLinksButton = this.page.locator('//div[text() = "Social Links"]/following::button[1]');
    private profileUploadButton = this.page.locator('//button[contains(text() , "Edit Profile")]/following::div[1]/div/div/button');
    private saveProfileButton = this.page.locator('//button[text() = "Save Photo"]');
    private chooseImage = this.page.locator('//label[contains(text() , "Choose Image")]');
    private profileImage = this.page.locator('//button[contains(text() , "Edit Profile")]/following::div[1]/div/div/div/img');
    private removeProfileButton = this.page.locator('//button[contains(text() , "Remove Photo")]');
    private usernameInitials = this.page.locator('//button[contains(text() , "Edit Profile")]/following::div[1]/div/div/div[contains(@style, "width: 72px")]');
    private username = this.page.locator('//h3').first();

    async isProfileImageVisible(): Promise<boolean> {
        logger.info("Checking visibility of profile image");
        return await this.isVisible(this.profileImage);
    }

    async fillSocialLink(socialMedia: string, socialLink: string) {
        logger.info(`Filling social link for ${socialMedia}: ${socialLink}`);
        const locator = this.page.locator(`//input[contains(@placeholder, "${socialMedia.toLocaleLowerCase()}")]`);
        await this.fill(locator, socialLink);
    }

    async clickSocialLink(socialMedia: string) {
        logger.info(`Clicking on ${socialMedia} social link`);
        
        [this.newPage] = await Promise.all([
            this.page.context().waitForEvent('page'),
            this.page.locator(`//a[contains(@href, "${socialMedia.toLocaleLowerCase()}")]`).click()
        ]);
        await this.newPage.waitForLoadState();
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
        const locator = this.page.locator(`//a[contains(@href, "${socialMedia}")]`);
        logger.info(`Locator for ${socialMedia} social link: ${locator}`);
        return await this.isVisible(locator);
    }

    async getCurrentPageUrl() {
        logger.info("Getting current page URL");
        return this.newPage.url();
    }

    async clickProfileUploadButton() {
        logger.info("Clicking on Profile Upload button");
        await this.click(this.profileUploadButton);
    }

    async clickChooseImageButton() {
        logger.info("Clicking on Choose Image button");
        await this.click(this.chooseImage);
    }

    async clickSaveProfileButton() {
        logger.info("Clicking on Save Profile button");
        await this.click(this.saveProfileButton);
    }

    async clickRemoveProfileButton() {
        logger.info("Clicking on Remove Profile button");
        await this.click(this.removeProfileButton);
    }

    async getUsernameInitials(): Promise<string> {
        logger.info("Getting username initials");
        await this.page.waitForTimeout(5000); 
        const usernameInitials = await this.usernameInitials.textContent();
        logger.info(`Username initials: ${usernameInitials}`);
        return usernameInitials || '';
    }

    async getUsername(): Promise<string> {
        logger.info("Getting username");
        const username = await this.username.textContent();
        logger.info(`Username: ${username}`);
        return username || '';
    }
}