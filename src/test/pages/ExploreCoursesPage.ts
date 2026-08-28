import { expect, Locator } from "@playwright/test";
import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class ExploreCoursesPage extends BasePage {

    /*
     * Dashboard
     */
    private exploreCoursesLink = this.page.getByText(
        "Explore Courses",
        { exact: true }
    ).first();


    /*
     * Tabs
     */
    private allTab = this.page.getByRole(
        "button",
        {
            name: "All",
            exact: true
        }
    );

    private joinTab = this.page.locator(':text-is("Join Training")')

    private openTab = this.page.getByRole(
        "button",
        {
            name: "Open",
            exact: true
        }
    );


    /*
     * Search
     */
    private searchInput = this.page.locator(
        'input[placeholder*="Search"], input[type="search"]'
    ).first();


    /*
     * Actual status/action locators
     */
    private joinTrainingButtons = this.page.locator(
        "button"
    ).filter({
        hasText: "Join Training"
    });

    private alreadyEnrolledStatus = this.page.getByText(
        "Already enrolled",
        {
            exact: true
        }
    );

    private trainingFullStatus = this.page.locator(
        "span"
    ).filter({
        hasText: "Training is full"
    });


    /*
     * Open Explore Courses
     */
    async openExploreCourses(): Promise<void> {

        logger.info("Opening Explore Courses");

        await this.exploreCoursesLink.waitFor({
            state: "visible",
            timeout: 15000
        });

        await this.exploreCoursesLink.click();

        await this.waitForCoursesToLoad();
    }


    /*
     * All tab
     */
    async clickAllTab(): Promise<void> {

        logger.info("Clicking All tab");

        await this.allTab.waitFor({
            state: "visible",
            timeout: 10000
        });

        await this.allTab.click();

        await this.waitForCoursesToLoad();
    }


    /*
     * Join tab
     */
    async clickJoinTab() {
    const joinTab = this.page.getByText('Join Training', {
        exact: true
    });

    await joinTab.waitFor({ state: 'visible' });
    await joinTab.click();
}


    /*
     * Open tab
     */
    async clickOpenTab(): Promise<void> {

        logger.info("Clicking Open tab");

        await this.openTab.waitFor({
            state: "visible",
            timeout: 10000
        });

        await this.openTab.click();

        await this.waitForCoursesToLoad();
    }


    /*
     * Search course
     */
    async searchCourse(courseName: string): Promise<void> {

        logger.info(
            `Searching course: ${courseName}`
        );

        await this.searchInput.waitFor({
            state: "visible",
            timeout: 10000
        });

        await this.searchInput.fill(courseName);

        await this.page.waitForTimeout(1000);
    }


    /*
     * Get course locator
     */
    private getCourse(courseName: string): Locator {

        return this.page.getByText(
            courseName,
            {
                exact: true
            }
        ).first();
    }


    /*
     * Check searched course
     */
    async isCourseDisplayed(
        courseName: string
    ): Promise<boolean> {

        return await this.getCourse(
            courseName
        ).isVisible().catch(() => false);
    }


    /*
     * Get course card
     */
    private async getCourseCard(
        courseName: string
    ): Promise<Locator> {

        const course = this.getCourse(
            courseName
        );

        await course.waitFor({
            state: "visible",
            timeout: 10000
        });

        const card = course.locator(
            'xpath=ancestor::*[' +
            './/button[contains(normalize-space(.),"Join Training")]' +
            ' or .//*[normalize-space(.)="Already enrolled"]' +
            ' or .//*[contains(normalize-space(.),"Training is full")]' +
            '][1]'
        );

        return card;
    }


    /*
     * Get actual status of searched course
     */
    async getCourseStatus(
        courseName: string
    ): Promise<string> {

        const card = await this.getCourseCard(
            courseName
        );


        /*
         * Already enrolled
         */
        const alreadyEnrolled =
            card.getByText(
                "Already enrolled",
                {
                    exact: true
                }
            );

        if (
            await alreadyEnrolled.isVisible().catch(() => false)
        ) {
            return "Already enrolled";
        }


        /*
         * Join Training
         */
        const joinTraining =
            card.locator("button").filter({
                hasText: "Join Training"
            });

        if (
            await joinTraining.isVisible().catch(() => false)
        ) {
            return "Join Training";
        }


        /*
         * Training is full
         */
        const trainingFull =
            card.getByText(
                "Training is full",
                {
                    exact: true
                }
            );

        if (
            await trainingFull.isVisible().catch(() => false)
        ) {
            return "Training is full";
        }


        return "Unknown";
    }


    /*
     * Click Join Training for searched course
     */
    async clickJoinTraining(
        courseName: string
    ): Promise<void> {

        logger.info(
            `Clicking Join Training for: ${courseName}`
        );

        const card = await this.getCourseCard(
            courseName
        );

        const joinTraining =
            card.locator("button").filter({
                hasText: "Join Training"
            }).first();

        await joinTraining.waitFor({
            state: "visible",
            timeout: 10000
        });

        await joinTraining.click();

        await this.waitForCoursesToLoad();
    }


    /*
     * Verify All tab
     */
    async verifyAllCourses(): Promise<void> {

        const joinTrainingCount =
            await this.joinTrainingButtons.count();

        const alreadyEnrolledCount =
            await this.alreadyEnrolledStatus.count();

        const fullCount =
            await this.trainingFullStatus.count();

        const totalCourses =
            joinTrainingCount +
            alreadyEnrolledCount +
            fullCount;

        logger.info(
            `All tab -> Join Training: ${joinTrainingCount}, ` +
            `Already enrolled: ${alreadyEnrolledCount}, ` +
            `Training is full: ${fullCount}`
        );

        expect(
            totalCourses,
            "No courses were displayed in All tab"
        ).toBeGreaterThan(0);
    }


    /*
     * Verify Join tab.
     *
     * Only Already enrolled courses should be present.
     */
    async verifyJoinTabCourses(): Promise<void> {

        await this.waitForCoursesToLoad();

        const alreadyEnrolledCount =
            await this.alreadyEnrolledStatus.count();

        const joinTrainingCount =
            await this.joinTrainingButtons.count();

        const fullCount =
            await this.trainingFullStatus.count();

        logger.info(
            `Join tab -> Already enrolled: ${alreadyEnrolledCount}, ` +
            `Join Training: ${joinTrainingCount}, ` +
            `Training is full: ${fullCount}`
        );

        expect(
            alreadyEnrolledCount,
            "Join tab should contain enrolled courses"
        ).toBeGreaterThan(0);

        expect(
            joinTrainingCount,
            "Join Training should not appear in Join tab"
        ).toBe(0);

        expect(
            fullCount,
            "Training is full should not appear in Join tab"
        ).toBe(0);
    }


    /*
     * Verify Open tab.
     *
     * Only Join Training courses should be present.
     */
    async verifyOpenTabCourses(): Promise<void> {

        await this.waitForCoursesToLoad();

        const joinTrainingCount =
            await this.joinTrainingButtons.count();

        const alreadyEnrolledCount =
            await this.alreadyEnrolledStatus.count();

        const fullCount =
            await this.trainingFullStatus.count();

        logger.info(
            `Open tab -> Join Training: ${joinTrainingCount}, ` +
            `Already enrolled: ${alreadyEnrolledCount}, ` +
            `Training is full: ${fullCount}`
        );

        expect(
            joinTrainingCount,
            "Open tab should contain Join Training courses"
        ).toBeGreaterThan(0);

        expect(
            alreadyEnrolledCount,
            "Already enrolled courses should not appear in Open tab"
        ).toBe(0);

        expect(
            fullCount,
            "Training is full courses should not appear in Open tab"
        ).toBe(0);
    }


    /*
     * Verify Register does not exist.
     */
    async verifyRegisterNotDisplayed(): Promise<void> {

        const registerButton =
            this.page.getByRole(
                "button",
                {
                    name: /register/i
                }
            );

        expect(
            await registerButton.count()
        ).toBe(0);
    }


    /*
     * Wait for course list
     */
    private async waitForCoursesToLoad(): Promise<void> {

        await this.page.waitForLoadState(
            "networkidle"
        ).catch(() => {});

        await this.page.waitForTimeout(500);
    }


    /*
     * Expose counts for step definitions
     */
    async getJoinTrainingCount(): Promise<number> {

        return await this.joinTrainingButtons.count();
    }

    async getAlreadyEnrolledCount(): Promise<number> {

        return await this.alreadyEnrolledStatus.count();
    }

    async getTrainingFullCount(): Promise<number> {

        return await this.trainingFullStatus.count();
    }
}