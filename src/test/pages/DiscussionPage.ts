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

    // Fallback locator for a custom (non-native) required field error message shown on the page
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

    // Fix: clicking a tab that is already active does not always trigger the app's
    // data refetch, so a post created while sitting on that tab can be missed.
    // Switching to the neighbouring tab first guarantees a real tab-switch event,
    // forcing the list to reload before we land back on the target tab.
    async openAllPostsTab() {
        logger.info("Opening the All Posts tab");
        if (await this.qnaTab.isVisible().catch(() => false)) {
            await this.click(this.qnaTab);
        }
        await this.click(this.allPostsTab);
        await this.page.waitForLoadState('networkidle').catch(() => { /* ignore if it never goes idle */ });
    }

    async openQnaTab() {
        logger.info("Opening the Q&A tab");
        if (await this.allPostsTab.isVisible().catch(() => false)) {
            await this.click(this.allPostsTab);
        }
        await this.click(this.qnaTab);
        await this.page.waitForLoadState('networkidle').catch(() => { /* ignore if it never goes idle */ });
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
        // Wait for the compose box to clear, which signals the post was accepted,
        // before moving on to the next action or visibility check.
        await expect(this.postTextBox).toHaveValue('', { timeout: 10000 }).catch(() => {
            logger.info("Post text box did not clear within 10s after submit; continuing anyway");
        });
        await this.page.waitForLoadState('networkidle').catch(() => { /* ignore if it never goes idle */ });
    }

    // Click Post while the message box is left empty, to trigger the "required" validation
    async submitPostWithoutMessage() {
        logger.info("Clicking the Post button without entering a message");
        await this.postTextBox.waitFor({ state: 'visible', timeout: 15000 });
        await this.click(this.postButton);
    }

    // Checks whether a required-field validation error is shown after an empty post submission.
    // 1) First checks the native HTML5 constraint-validation message on the text box (covers <textarea required>).
    // 2) Falls back to looking for a custom on-screen error message (e.g. "Please fill this field").
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

    // ---------------------------------------------------------------------
    // Reply & Delete support
    //
    // Every post/reply is rendered as a repeating "card" that holds the
    // message text plus its own Reply link and delete icon. To act on the
    // Reply link or delete icon that belongs to a *specific* post/reply
    // (not just the first one on the page), we first locate the exact
    // message text (each message carries a unique timestamp suffix, so the
    // text match is unambiguous) and then walk up to the nearest ancestor
    // card that also contains a "Reply" link or a button/icon.
    //
    // If your app exposes data-testid attributes on the Reply link or the
    // delete icon, prefer those over this XPath fallback - it will be far
    // more robust than walking the DOM by structure.
    // ---------------------------------------------------------------------
    private getCard(message: string): Locator {
        const messageLocator = this.page.getByText(message, { exact: true });
        return messageLocator.locator(
            'xpath=ancestor::*[self::div or self::li or self::article]' +
            '[.//*[normalize-space(text())="Reply"] or .//button or .//svg][1]'
        );
    }

    // Fix: the reply compose box observed in the app stays open after a reply is
    // posted (it does not auto-close), ready for another reply. Clicking the
    // "Reply" link again in that state toggles the box CLOSED instead of opening
    // a fresh one. This method is idempotent: it only clicks "Reply" if the
    // compose box for this post is not already open, so it is safe to call
    // multiple times in a row (e.g. when posting two replies to the same post).
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

    // Scoped to the specific post's card so it can't accidentally fill a reply
    // box belonging to a different post on the page.
    async enterReplyMessage(message: string, postMessage: string) {
        logger.info(`Entering reply message: ${message}`);
        const card = this.getCard(postMessage);
        const replyBox = card.getByPlaceholder('Write your reply...').first();
        await this.fill(replyBox, message);
    }

    // Scoped to the specific post's card for the same reason as enterReplyMessage.
    async submitReply(postMessage: string) {
        logger.info("Clicking the Post Reply button");
        const card = this.getCard(postMessage);
        const postReplyButton = card.getByText('Post Reply', { exact: true }).first();
        await this.click(postReplyButton);
        await this.page.waitForLoadState('networkidle').catch(() => { /* ignore if it never goes idle */ });
    }

    async clickDeleteIcon(message: string) {
        logger.info(`Clicking the delete icon for message: ${message}`);
        const card = this.getCard(message);

        // Confirmed from the app's DOM: every post/reply's delete icon is rendered as
        // <button title="Delete Post" class="cdb-btn-icon cdb-btn-icon--delete">
        const deleteIcon = card.locator('button.cdb-btn-icon--delete').first();
        if (await deleteIcon.count() > 0) {
            await this.click(deleteIcon);
            return;
        }

        // Fallback in case the class name ever changes
        const namedDeleteButton = card.getByRole('button', { name: /delete/i }).first();
        await this.click(namedDeleteButton);
    }

    async isDeleteConfirmationPopupVisible(timeout = 5000): Promise<boolean> {
        // The modal has a heading AND a confirm button that both read exactly "Delete Post".
        // getByText('Delete Post', { exact: true }) matches both, which trips Playwright's
        // strict-mode check and throws - silently caught below as "not visible" even when
        // the popup is genuinely open. Scoping to the heading role fixes the ambiguity.
        const popupHeading = this.page.getByRole('heading', { name: 'Delete Post', exact: true });
        try {
            await expect(popupHeading).toBeVisible({ timeout });
            return true;
        } catch {
            return false;
        }
    }

    // The modal's own container: the nearest ancestor of the "Delete Post" heading that
    // also contains a button. Every delete icon on the page shares the accessible name
    // "Delete Post" (its title attribute), so the confirm/cancel buttons must be scoped
    // to inside the modal itself - otherwise getByRole('button', { name: 'Delete Post' })
    // matches every delete icon on the page as well as the modal's own button.
    private getDeleteModalContainer(): Locator {
        const popupHeading = this.page.getByRole('heading', { name: 'Delete Post', exact: true });
        return popupHeading.locator('xpath=ancestor::*[self::div][.//button][1]');
    }

    async confirmDeletePost() {
        logger.info("Confirming delete in the Delete Post popup");
        // Confirmed via Playwright recording: the confirm button's visible label is
        // wrapped in its own <span>, which the delete icons don't have (they only carry
        // a "title" attribute), so this is unique without needing extra scoping.
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
        // Confirmed via Playwright recording: exact toast text, including the trailing period.
        const toast = this.page.getByText('Post deleted successfully.', { exact: true });
        try {
            await expect(toast).toBeVisible({ timeout });
            return true;
        } catch {
            return false;
        }
    }
}