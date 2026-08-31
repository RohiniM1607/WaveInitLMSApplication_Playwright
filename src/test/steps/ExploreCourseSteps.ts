import {
    When,
    Then
} from "@cucumber/cucumber";

import { expect } from "@playwright/test";

import { CustomWorld } from "../../main/support/CustomWorld";
import { CSVReader } from "../../main/utils/csv_reader";
import { logger } from "../../main/utils/logger";
import { ExploreCourseData } from "../../main/types/ExploreCoursesData";

const STEP_TIMEOUT = {
    timeout: 60 * 1000
};


/*
 * Open Explore Courses
 */
When(
    'the learner clicks on "Explore Courses" from the dashboard header',
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        await this.exploreCoursesPage.openExploreCourses();
    }
);


/*
 * All tab
 */
When(
    'the learner clicks on the Explore Courses "All" tab',
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        await this.exploreCoursesPage.clickAllTab();
    }
);


/*
 * Joined tab
 *
 * FIX: was previously "Join" tab, which matched the wrong element in
 * the page object (it clicked the "Join Training" button on a course
 * card instead of the "Joined" tab). The real UI tab is "Joined".
 */
When(
    'the learner clicks on the Explore Courses "Joined" tab',
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        await this.exploreCoursesPage.clickJoinedTab();
    }
);


/*
 * Open tab
 */
When(
    'the learner clicks on the Explore Courses "Open" tab',
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        await this.exploreCoursesPage.clickOpenTab();
    }
);


/*
 * Verify All courses
 */
Then(
    "all courses should be displayed",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        await this.exploreCoursesPage.verifyAllCourses();
    }
);


/*
 * Verify course statuses in All tab
 */
Then(
    "every course should show Join Training, Already enrolled or Training is full status",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const joinTrainingCount = await this.exploreCoursesPage.getJoinTrainingCount();
        const alreadyEnrolledCount = await this.exploreCoursesPage.getAlreadyEnrolledCount();
        const fullCount = await this.exploreCoursesPage.getTrainingFullCount();

        const total = joinTrainingCount + alreadyEnrolledCount + fullCount;

        expect(
            total,
            "At least one course with a valid enrollment status should be displayed"
        ).toBeGreaterThan(0);

        logger.info(`Join Training: ${joinTrainingCount}`);
        logger.info(`Already enrolled: ${alreadyEnrolledCount}`);
        logger.info(`Training is full: ${fullCount}`);
    }
);


/*
 * Read course name from CSV and search
 */
When(
    "the learner enters the course name from test data in the search field",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const filePath = "src/resources/data/exploreCourses.csv";

        const testData = CSVReader.getData<ExploreCourseData>(filePath);

        if (!testData.length) {
            throw new Error("exploreCourses.csv does not contain test data");
        }

        const courseName = testData[0].courseName;

        if (!courseName) {
            throw new Error("courseName is missing from exploreCourses.csv");
        }

        this.courseName = courseName;

        logger.info(`Searching course from test data: ${courseName}`);

        await this.exploreCoursesPage.searchCourse(courseName);
    }
);


/*
 * Verify searched course
 */
Then(
    "the searched course should be displayed",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        if (!this.courseName) {
            throw new Error("Course name was not loaded from test data");
        }

        const displayed = await this.exploreCoursesPage.isCourseDisplayed(this.courseName);

        expect(
            displayed,
            `Course "${this.courseName}" should be displayed`
        ).toBe(true);
    }
);


/*
 * Verify current enrollment status
 */
Then(
    "the learner should see the correct enrollment status for the searched course",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        if (!this.courseName) {
            throw new Error("Course name was not loaded from test data");
        }

        const status = await this.exploreCoursesPage.getCourseStatus(this.courseName);

        this.courseStatus = status;

        logger.info(`Course: ${this.courseName}`);
        logger.info(`Current status: ${status}`);

        expect([
            "Join Training",
            "Already enrolled",
            "Training is full"
        ]).toContain(status);
    }
);


/*
 * Join searched course only when Join Training is available
 */
When(
    "the learner joins the searched course if Join Training is available",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        if (!this.courseName) {
            throw new Error("Course name was not loaded from test data");
        }

        const courseName = this.courseName;

        const status = await this.exploreCoursesPage.getCourseStatus(courseName);

        this.courseStatus = status;

        logger.info(`Attempting to join course: ${courseName}`);
        logger.info(`Current course status: ${status}`);

        if (status === "Join Training") {
            await this.exploreCoursesPage.clickJoinTraining(courseName);
            logger.info(`Join Training clicked for: ${courseName}`);
            return;
        }

        if (status === "Already enrolled") {
            logger.info(`${courseName} is already enrolled. No registration required.`);
            return;
        }

        if (status === "Training is full") {
            logger.info(`${courseName} is full. Registration is not possible.`);
            return;
        }

        throw new Error(`Unexpected status for ${courseName}: ${status}`);
    }
);


/*
 * Verify final enrollment status after join attempt
 */
Then(
    "the searched course should show the correct final enrollment status",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        if (!this.courseName) {
            throw new Error("Course name was not loaded from test data");
        }

        const finalStatus = await this.exploreCoursesPage.getCourseStatus(this.courseName);

        this.courseStatus = finalStatus;

        logger.info(`Final status for ${this.courseName}: ${finalStatus}`);

        expect([
            "Already enrolled",
            "Training is full"
        ]).toContain(finalStatus);
    }
);


/*
 * Joined tab
 */
Then(
    "only enrolled courses should be displayed",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        await this.exploreCoursesPage.verifyJoinedTabCourses();
    }
);


/*
 * Joined tab status
 */
Then(
    'every course should show "Already enrolled" status',
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const alreadyEnrolledCount = await this.exploreCoursesPage.getAlreadyEnrolledCount();
        const joinTrainingCount = await this.exploreCoursesPage.getJoinTrainingCount();
        const fullCount = await this.exploreCoursesPage.getTrainingFullCount();

        expect(
            alreadyEnrolledCount,
            "Joined tab should contain at least one enrolled course"
        ).toBeGreaterThan(0);

        expect(
            joinTrainingCount,
            "Joined tab should not contain Join Training courses"
        ).toBe(0);

        expect(
            fullCount,
            "Joined tab should not contain full courses"
        ).toBe(0);
    }
);


/*
 * Open tab
 */
Then(
    "only courses available for joining should be displayed",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        await this.exploreCoursesPage.verifyOpenTabCourses();
    }
);


/*
 * Open tab status
 */
Then(
    'every course should show "Join Training"',
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const count = await this.exploreCoursesPage.getJoinTrainingCount();

        expect(
            count,
            "Open tab should contain at least one Join Training course"
        ).toBeGreaterThan(0);
    }
);


/*
 * Already enrolled should not appear
 */
Then(
    "Already enrolled courses should not be displayed",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const count = await this.exploreCoursesPage.getAlreadyEnrolledCount();

        expect(count).toBe(0);
    }
);


/*
 * Full courses should not appear
 */
Then(
    "Training is full courses should not be displayed",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const count = await this.exploreCoursesPage.getTrainingFullCount();

        expect(count).toBe(0);
    }
);


/*
 * Register should not exist
 */
Then(
    "Register option should not be displayed",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        await this.exploreCoursesPage.verifyRegisterNotDisplayed();
    }
);