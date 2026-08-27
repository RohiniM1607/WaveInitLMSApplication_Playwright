import { expect, Locator } from "playwright/test";
import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class DiscussionPage extends BasePage {

    private myCoursesLink = this.page.getByText('My Courses', { exact: true }).first();
    private discussionsTabs = this.page.getByText('Discussions', { exact: true });

    private allPostsTab = this.page.getByText('All Posts', { exact: true });
    private qnaTab = this.page.getByText('Q&A', { exact: true });

    private postTextBox = this.page.getByPlaceholder("What's on your mind? Write a post, ask a question, or share an announcement...");
    private postTypeDropdown = this.page.locator('select.cdb-select');
    private postButton = this.page.getByText('Post', { exact: true });
    private requiredFieldErrorText = this.page.getByText(/please\s*fill|this field is required|field is required|required field/i).first();

    async openMyCourses() {
        logger.info("Opening My Courses");
        await this.click(this.myCoursesLink);
    }

    async openCourseByName(courseName: string) {
        logger.info(`Opening course: ${courseName}`);
        const courseHeading = this.page.getByRole('heading', { name: courseName });
        await courseHeading.waitFor({ state: 'visible', timeout: 30000 });
        await this.click(courseHeading);
    }

    async openDiscussionsTab() {
        logger.info("Opening the Discussions tab");
        await this.discussionsTabs.nth(0).waitFor({ state: 'visible', timeout: 30000 });
        await this.click(this.discussionsTabs.nth(0));
    }

    async openAllPostsTab() {
        logger.info("Opening the All Posts tab");
        if (await this.qnaTab.isVisible().catch(() => false)) {
            await this.click(this.qnaTab);
        }
        await this.click(this.allPostsTab);
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    async openQnaTab() {
        logger.info("Opening the Q&A tab");
        if (await this.allPostsTab.isVisible().catch(() => false)) {
            await this.click(this.allPostsTab);
        }
        await this.click(this.qnaTab);
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    async selectPostType(postType: string) {
        logger.info(`Selecting post type: ${postType}`);
        await this.postTypeDropdown.selectOption({ label: postType });
    }

    async enterPostMessage(message: string) {
        logger.info(`Entering post message: ${message}`);
        await this.fill(this.postTextBox, message);
    }

    async submitPost() {
        logger.info("Clicking the Post button");
        await this.click(this.postButton);
        await expect(this.postTextBox).toHaveValue('', { timeout: 10000 }).catch(() => {
            logger.info("Post text box did not clear within 10s after submit; continuing anyway");
        });
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    async submitPostWithoutMessage() {
        logger.info("Clicking the Post button without entering a message");
        await this.postTextBox.waitFor({ state: 'visible', timeout: 15000 });
        await this.click(this.postButton);
    }

    async isRequiredValidationErrorDisplayed(timeout = 5000): Promise<boolean> {
        try {
            const nativeMessage = await this.postTextBox.evaluate(
                (el: HTMLTextAreaElement | HTMLInputElement) => el.validationMessage
            );
            if (nativeMessage && nativeMessage.trim().length > 0) {
                logger.info(`Native required-field validation message found: "${nativeMessage}"`);
                return true;
            }
        } catch (e) {
            logger.info("Could not read native validationMessage, falling back to custom error text check");
        }

        try {
            await expect(this.requiredFieldErrorText).toBeVisible({ timeout });
            logger.info("Custom required-field validation error text found on screen");
            return true;
        } catch {
            logger.info("No required-field validation error was found (native or custom)");
            return false;
        }
    }

    async isPostVisible(message: string, timeout = 20000): Promise<boolean> {
        const post = this.page.getByText(message, { exact: true }).first();
        try {
            await expect(post).toBeVisible({ timeout });
            return true;
        } catch {
            return false;
        }
    }


    private getCard(message: string): Locator {
        const messageLocator = this.page.getByText(message, { exact: true });
        return messageLocator.locator(
            'xpath=ancestor::*[self::div or self::li or self::article]' +
            '[.//*[normalize-space(text())="Reply"] or .//button or .//svg][1]'
        );
    }

    async clickReplyLink(message: string) {
        const card = this.getCard(message);
        const replyBox = card.getByPlaceholder('Write your reply...');
        const isBoxAlreadyOpen = await replyBox.first().isVisible({ timeout: 2000 }).catch(() => false);

        if (isBoxAlreadyOpen) {
            logger.info(`Reply box is already open for message: ${message} - skipping the Reply link click`);
            return;
        }

        logger.info(`Clicking the Reply link for message: ${message}`);
        const replyLink = card.getByText('Reply', { exact: true }).first();
        await this.click(replyLink);
        await replyBox.first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async enterReplyMessage(message: string, postMessage: string) {
        logger.info(`Entering reply message: ${message}`);
        const card = this.getCard(postMessage);
        const replyBox = card.getByPlaceholder('Write your reply...').first();
        await this.fill(replyBox, message);
    }


    async submitReply(postMessage: string) {
        logger.info("Clicking the Post Reply button");
        const card = this.getCard(postMessage);
        const postReplyButton = card.getByText('Post Reply', { exact: true }).first();
        await this.click(postReplyButton);
        await this.page.waitForLoadState('networkidle').catch(() => {  });
    }

    async clickDeleteIcon(message: string) {
        logger.info(`Clicking the delete icon for message: ${message}`);
        const card = this.getCard(message);


        const deleteIcon = card.locator('button.cdb-btn-icon--delete').first();
        if (await deleteIcon.count() > 0) {
            await this.click(deleteIcon);
            return;
        }
        const namedDeleteButton = card.getByRole('button', { name: /delete/i }).first();
        await this.click(namedDeleteButton);
    }

    async isDeleteConfirmationPopupVisible(timeout = 5000): Promise<boolean> {
        const popupHeading = this.page.getByRole('heading', { name: 'Delete Post', exact: true });
        try {
            await expect(popupHeading).toBeVisible({ timeout });
            return true;
        } catch {
            return false;
        }
    }

    private getDeleteModalContainer(): Locator {
        const popupHeading = this.page.getByRole('heading', { name: 'Delete Post', exact: true });
        return popupHeading.locator('xpath=ancestor::*[self::div][.//button][1]');
    }

    async confirmDeletePost() {
        logger.info("Confirming delete in the Delete Post popup");
        const confirmButton = this.page.locator('span:has-text("Delete Post")').last();
        await this.click(confirmButton);
    }

    async cancelDeletePost() {
        logger.info("Cancelling the Delete Post popup");
        const modal = this.getDeleteModalContainer();
        const cancelButton = modal.getByRole('button', { name: 'Cancel', exact: true });
        await this.click(cancelButton);
    }

    async isDeleteSuccessMessageVisible(timeout = 10000): Promise<boolean> {
        const toast = this.page.getByText('Post deleted successfully.', { exact: true });
        try {
            await expect(toast).toBeVisible({ timeout });
            return true;
        } catch {
            return false;
        }
    }
}