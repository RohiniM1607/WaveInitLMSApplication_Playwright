import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../main/support/CustomWorld";
import discussionData from "../../resources/data/discussionData.json";

const STEP_TIMEOUT = { timeout: 60 * 1000 };

Given('the learner opens {string}', STEP_TIMEOUT, async function (this: CustomWorld, linkName: string) {
    if (linkName === "My Courses") {
        await this.discussionPage.openMyCourses();
    }
});

Given('the learner opens the course from test data', STEP_TIMEOUT, async function (this: CustomWorld) {
    await this.discussionPage.openCourseByName(discussionData.course.name);
});

Given('the learner clicks on the {string} tab', STEP_TIMEOUT, async function (this: CustomWorld, tabName: string) {
    if (tabName === "Discussions") {
        await this.discussionPage.openDiscussionsTab();
    }
});

When('the learner selects {string} from the post type dropdown', STEP_TIMEOUT, async function (this: CustomWorld, postType: string) {
    await this.discussionPage.selectPostType(postType);
});

When('the learner enters the message for {string} from test data', STEP_TIMEOUT, async function (this: CustomWorld, postType: string) {
    const posts = discussionData.posts as Record<string, string>;
    const baseMessage = posts[postType];
    const uniqueMessage = `${baseMessage} - ${Date.now()}`;
    this.lastPostedMessage = uniqueMessage;
    await this.discussionPage.enterPostMessage(uniqueMessage);
});

When('the learner clicks the {string} button', STEP_TIMEOUT, async function (this: CustomWorld, buttonName: string) {
    if (buttonName === "Post") {
        await this.discussionPage.submitPost();
    }
});

Then('the posted message should be visible under the {string} tab', STEP_TIMEOUT, async function (this: CustomWorld, tabName: string) {
    if (tabName === "All Posts") {
        await this.discussionPage.openAllPostsTab();
    } else if (tabName === "Q&A") {
        await this.discussionPage.openQnaTab();
    }
    const isVisible = await this.discussionPage.isPostVisible(this.lastPostedMessage);
    expect(isVisible).toBe(true);
});