import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../main/support/CustomWorld";

const STEP_TIMEOUT = { timeout: 60 * 1000 };

Given('the learner clicks on {string} from the dashboard header', STEP_TIMEOUT, async function (this: CustomWorld, linkName: string) {
    if (linkName === "Explore Courses") {
        await this.exploreCoursesPage.openExploreCourses();
    }
});

Then('the learner should be on the {string} courses tab', STEP_TIMEOUT, async function (this: CustomWorld, tabName: string) {
    if (tabName === "Available") {
        const isVisible = await this.exploreCoursesPage.isOnAvailableTab();
        expect(isVisible).toBe(true);
    }
});

When('the learner checks the status of every course card on the {string} tab', STEP_TIMEOUT, async function (this: CustomWorld) {
    const count = await this.exploreCoursesPage.getCourseCardCount();
    expect(count).toBeGreaterThan(0);

    this.courseStatuses = [];
    for (let i = 0; i < count; i++) {
        this.courseStatuses.push(await this.exploreCoursesPage.getCourseStatus(i));
    }
});

Then('every course card should show either {string}, {string} or {string} as its status', STEP_TIMEOUT, async function (this: CustomWorld, statusOne: string, statusTwo: string, statusThree: string) {
    const allowedStatuses = [statusOne, statusTwo, statusThree];
    for (const status of this.courseStatuses) {
        expect(allowedStatuses).toContain(status);
    }
});

When('the learner opens a course card that shows the {string} status', STEP_TIMEOUT, async function (this: CustomWorld, status: string) {
    await this.exploreCoursesPage.openFirstCourseWithStatus(status);
});

Then('the course details should show the {string} button only', STEP_TIMEOUT, async function (this: CustomWorld, buttonName: string) {
    if (buttonName === "Register") {
        const isVisible = await this.exploreCoursesPage.isRegisterButtonVisible();
        expect(isVisible).toBe(true);
    }
});

Then('the {string} status should not be visible on the course details', STEP_TIMEOUT, async function (this: CustomWorld, status: string) {
    if (status === "Already Joined") {
        const isVisible = await this.exploreCoursesPage.isAlreadyJoinedVisible(5000);
        expect(isVisible).toBe(false);
    }
});

When('the learner clicks the {string} button on the course details', STEP_TIMEOUT, async function (this: CustomWorld, buttonName: string) {
    if (buttonName === "Register") {
        await this.exploreCoursesPage.clickRegisterButton();
    }
});

Then('the course details should show the {string} status only', STEP_TIMEOUT, async function (this: CustomWorld, status: string) {
    if (status === "Already Joined") {
        const isVisible = await this.exploreCoursesPage.isAlreadyJoinedVisible();
        expect(isVisible).toBe(true);
    }
});

Then('the {string} button should not be visible on the course details', STEP_TIMEOUT, async function (this: CustomWorld, buttonName: string) {
    if (buttonName === "Register") {
        const isHidden = await this.exploreCoursesPage.isRegisterButtonHidden();
        expect(isHidden).toBe(true);
    }
});

Then('the course details should show the {string} status', STEP_TIMEOUT, async function (this: CustomWorld, status: string) {
    if (status === "Full") {
        const isVisible = await this.exploreCoursesPage.isFullStatusVisible();
        expect(isVisible).toBe(true);
    } else if (status === "Already Joined") {
        const isVisible = await this.exploreCoursesPage.isAlreadyJoinedVisible();
        expect(isVisible).toBe(true);
    }
});