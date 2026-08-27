import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../main/support/CustomWorld";
import { CSVReader } from "../../main/utils/csv_reader";
import discussionData from "../../resources/data/discussionData.json";

const STEP_TIMEOUT = { timeout: 60 * 1000 };

interface DiscussionReplyRow {
    postType: string;
    replyKey: string;
    message: string;
}

const discussionReplyData = CSVReader.getData<DiscussionReplyRow>(
    "src/resources/data/discussionReplyData.csv"
);

function getReplyBaseMessage(postType: string, replyKey: string): string {
    const row = discussionReplyData.find(
        (r) => r.postType === postType && r.replyKey === replyKey
    );
    if (!row) {
        throw new Error(
            `No reply test data found for postType="${postType}" replyKey="${replyKey}" in discussionReplyData.csv`
        );
    }
    return row.message;
}

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
    } else if (buttonName === "Post Reply") {
        await this.discussionPage.submitReply(this.lastPostedMessage);
    }
});

When('the learner clicks the {string} button without entering a message', STEP_TIMEOUT, async function (this: CustomWorld, buttonName: string) {
    if (buttonName === "Post") {
        await this.discussionPage.submitPostWithoutMessage();
    }
});

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

Then('a required field validation error should be displayed', STEP_TIMEOUT, async function (this: CustomWorld) {
    const isErrorDisplayed = await this.discussionPage.isRequiredValidationErrorDisplayed();
    expect(isErrorDisplayed).toBe(true);
});

// Reply steps

When('the learner clicks the {string} link on the posted message', STEP_TIMEOUT, async function (this: CustomWorld, linkName: string) {
    if (linkName === "Reply") {
        await this.discussionPage.clickReplyLink(this.lastPostedMessage);
    }
});

When('the learner enters the {string} reply message for {string} from test data', STEP_TIMEOUT, async function (this: CustomWorld, replyKey: string, postType: string) {
    const baseMessage = getReplyBaseMessage(postType, replyKey);
    const uniqueMessage = `${baseMessage} - ${Date.now()}`;
    this.replyMessages = this.replyMessages || {};
    this.replyMessages[replyKey] = uniqueMessage;
    await this.discussionPage.enterReplyMessage(uniqueMessage, this.lastPostedMessage);
});

Then('the {string} reply message should be visible below the posted message', STEP_TIMEOUT, async function (this: CustomWorld, replyKey: string) {
    const message = this.replyMessages?.[replyKey];
    if (!message) {
        throw new Error(`No reply message stored for key "${replyKey}"`);
    }
    const isVisible = await this.discussionPage.isPostVisible(message);
    expect(isVisible).toBe(true);
});

Then('the {string} reply message should not be visible below the posted message', STEP_TIMEOUT, async function (this: CustomWorld, replyKey: string) {
    const message = this.replyMessages?.[replyKey];
    if (!message) {
        throw new Error(`No reply message stored for key "${replyKey}"`);
    }
    const isVisible = await this.discussionPage.isPostVisible(message, 5000);
    expect(isVisible).toBe(false);
});

// Delete (post and reply)

When('the learner clicks the delete icon on the posted message', STEP_TIMEOUT, async function (this: CustomWorld) {
    await this.discussionPage.clickDeleteIcon(this.lastPostedMessage);
});

When('the learner clicks the delete icon on the {string} reply message', STEP_TIMEOUT, async function (this: CustomWorld, replyKey: string) {
    const message = this.replyMessages?.[replyKey];
    if (!message) {
        throw new Error(`No reply message stored for key "${replyKey}"`);
    }
    await this.discussionPage.clickDeleteIcon(message);
});

Then('a delete confirmation popup should be displayed', STEP_TIMEOUT, async function (this: CustomWorld) {
    const isVisible = await this.discussionPage.isDeleteConfirmationPopupVisible();
    expect(isVisible).toBe(true);
});

When('the learner confirms the delete action', STEP_TIMEOUT, async function (this: CustomWorld) {
    await this.discussionPage.confirmDeletePost();
});

Then('a post deleted success message should be displayed', STEP_TIMEOUT, async function (this: CustomWorld) {
    const isVisible = await this.discussionPage.isDeleteSuccessMessageVisible();
    expect(isVisible).toBe(true);
});

Then('the posted message should not be visible under the {string} tab', STEP_TIMEOUT, async function (this: CustomWorld, tabName: string) {
    if (tabName === "All Posts") {
        await this.discussionPage.openAllPostsTab();
    } else if (tabName === "Q&A") {
        await this.discussionPage.openQnaTab();
    }
    const isVisible = await this.discussionPage.isPostVisible(this.lastPostedMessage, 5000);
    expect(isVisible).toBe(false);
});