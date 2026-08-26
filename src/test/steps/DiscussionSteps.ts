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

// Click Post without typing anything into the post text box (used for the empty-post validation scenario)
When('the learner clicks the {string} button without entering a message', STEP_TIMEOUT, async function (this: CustomWorld, buttonName: string) {
    if (buttonName === "Post") {
        await this.discussionPage.submitPostWithoutMessage();
    }
});

// Data-driven: no post type names are hardcoded here — every entry under discussionData.posts is posted in turn.
When('the learner creates a post for each post type from test data', STEP_TIMEOUT, async function (this: CustomWorld) {
    const posts = discussionData.posts as Record<string, string>;
    this.lastPostedMessages = [];

    for (const postType of Object.keys(posts)) {
        const uniqueMessage = `${posts[postType]} - ${Date.now()}`;
        this.lastPostedMessages.push(uniqueMessage);

        await this.discussionPage.selectPostType(postType);
        await this.discussionPage.enterPostMessage(uniqueMessage);
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

// Verifies every message collected while looping through the post types is visible under the given tab.
Then('all the posted messages should be visible under the {string} tab', STEP_TIMEOUT, async function (this: CustomWorld, tabName: string) {
    if (tabName === "All Posts") {
        await this.discussionPage.openAllPostsTab();
    } else if (tabName === "Q&A") {
        await this.discussionPage.openQnaTab();
    }

    for (const message of this.lastPostedMessages) {
        const isVisible = await this.discussionPage.isPostVisible(message);
        expect(isVisible).toBe(true);
    }
});

// Verifies a required-field validation error is shown when Post is clicked with an empty message
Then('a required field validation error should be displayed', STEP_TIMEOUT, async function (this: CustomWorld) {
    const isErrorDisplayed = await this.discussionPage.isRequiredValidationErrorDisplayed();
    expect(isErrorDisplayed).toBe(true);
});