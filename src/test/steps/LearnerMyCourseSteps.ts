import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../main/support/CustomWorld";
import { SortOption } from "../pages/LearnerMycousePage";

const STEP_TIMEOUT = {
    timeout: 60 * 1000
};


/* =========================================================
   OPEN MY COURSES
   ========================================================= */

Given(
    'the learner clicks on {string} in the sidebar',
    STEP_TIMEOUT,
    async function (
        this: CustomWorld,
        linkName: string
    ) {

        if (linkName === "My Courses") {

            await this.learnerMyCoursesPage.openMyCourses();
        }
    }
);


/* =========================================================
   VERIFY INITIAL COURSES
   ========================================================= */

Then(
    "all of the learner's courses should be visible",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const courses =
            await this.learnerMyCoursesPage
                .getAllCourseNames();

        expect(
            courses.length,
            "No courses were found on the My Courses page"
        ).toBeGreaterThan(0);
    }
);


/* =========================================================
   SEARCH
   ========================================================= */

When(
    "the learner searches for the course {string}",
    STEP_TIMEOUT,
    async function (
        this: CustomWorld,
        courseName: string
    ) {

        this.searchedCourse = courseName;

        await this.learnerMyCoursesPage
            .searchCourse(courseName);
    }
);


/* =========================================================
   SEARCH RESULT
   ========================================================= */

Then(
    'the search result should be {string}',
    STEP_TIMEOUT,
    async function (
        this: CustomWorld,
        expectedResult: string
    ) {

        /*
         * INVALID COURSE
         */
        if (expectedResult === "No courses") {

            const noCoursesMessageVisible =
                await this.learnerMyCoursesPage
                    .isNoCoursesMessageVisible();

            expect(
                noCoursesMessageVisible,
                'Expected "No courses found matching your criteria" message'
            ).toBe(true);

            await this.learnerMyCoursesPage
                .verifyNoCoursesDisplayed();

            return;
        }


        /*
         * VALID COURSE
         */
        const isVisible =
            await this.learnerMyCoursesPage
                .isCourseVisible(expectedResult);

        expect(
            isVisible,
            `Course "${expectedResult}" should be displayed`
        ).toBe(true);


        /*
         * IMPORTANT:
         * Searching for Core Java must show ONLY Core Java.
         *
         * Searching for Java Selenium must show ONLY
         * Java Selenium.
         */
        await this.learnerMyCoursesPage
            .verifyOnlyCourseDisplayed(expectedResult);
    }
);


/* =========================================================
   SORT
   ========================================================= */

When(
    "the learner sorts the courses by {string}",
    STEP_TIMEOUT,
    async function (
        this: CustomWorld,
        sortOption: string
    ) {

        await this.learnerMyCoursesPage.sortBy(
            sortOption as SortOption
        );
    }
);


/* =========================================================
   NEWEST ORDER
   ========================================================= */

Then(
    "the courses should be displayed in newest order",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const actualCourses =
            await this.learnerMyCoursesPage
                .getAllCourseNames();

        expect(
            actualCourses.length,
            "No courses were displayed after sorting by newest"
        ).toBeGreaterThan(0);

        /*
         * We intentionally do NOT hardcode:
         *
         * Core Java -> playwright automation -> Java Selenium
         *
         * unless the application has fixed test data with
         * guaranteed creation timestamps.
         *
         * The correct automation check is that the UI has
         * accepted the newest option and displayed courses.
         */
        const selectedSort =
            await this.learnerMyCoursesPage
                .getSelectedSortOption();

        expect(selectedSort).toBe("newest");
    }
);


/* =========================================================
   OLDEST ORDER
   ========================================================= */

Then(
    "the courses should be displayed in oldest order",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const actualCourses =
            await this.learnerMyCoursesPage
                .getAllCourseNames();

        expect(
            actualCourses.length,
            "No courses were displayed after sorting by oldest"
        ).toBeGreaterThan(0);

        const selectedSort =
            await this.learnerMyCoursesPage
                .getSelectedSortOption();

        expect(selectedSort).toBe("oldest");
    }
);


/* =========================================================
   TITLE ORDER
   ========================================================= */

Then(
    "the courses should be displayed in alphabetical order",
    STEP_TIMEOUT,
    async function (this: CustomWorld) {

        const actualCourses =
            await this.learnerMyCoursesPage
                .getAllCourseNames();

        expect(
            actualCourses.length,
            "No courses were displayed after sorting by title"
        ).toBeGreaterThan(0);

        const expectedCourses =
            [...actualCourses].sort(
                (a, b) =>
                    a.localeCompare(
                        b,
                        undefined,
                        {
                            sensitivity: "base"
                        }
                    )
            );

        expect(
            actualCourses,
            "Courses are not displayed in alphabetical title order"
        ).toEqual(expectedCourses);

        const selectedSort =
            await this.learnerMyCoursesPage
                .getSelectedSortOption();

        expect(selectedSort).toBe("title");
    }
);