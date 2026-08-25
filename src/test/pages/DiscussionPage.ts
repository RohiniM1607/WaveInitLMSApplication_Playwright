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
        await this.click(this.allPostsTab);
    }

    async openQnaTab() {
        logger.info("Opening the Q&A tab");
        await this.click(this.qnaTab);
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
    }

    async isPostVisible(message: string, timeout = 15000): Promise<boolean> {
    const post = this.page.getByText(message, { exact: true }).first();
    try {
        await expect(post).toBeVisible({ timeout });
        return true;
    } catch {
        return false;
    }
}
}