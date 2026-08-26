import { expect } from "playwright/test";
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
}