import { expect, Locator } from "@playwright/test";
import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class ExploreCoursesPage extends BasePage {
    private exploreCoursesLink = this.page.getByText("Explore Courses",{ exact: true }).first();
    private exploreTrainingsLink = this.page.getByText("Explore Trainings",{ exact: true }).first();
    private explorePageHeading = this.page.getByRole("heading",{ name: "Explore Trainings", exact: true });
    private allTab = this.page.getByRole("button",{ name: "All", exact: true });

    private openTab = this.page.getByRole("button",{ name: "Open", exact: true });
    private joinedTab = this.page.getByRole("button",{ name: "Joined", exact: true });

    private searchInput = this.page.locator('input[placeholder*="Search"], input[type="search"]').first();
    private joinTrainingButtons = this.page.locator("button").filter({hasText: "Join Training"});

    private alreadyEnrolledStatus = this.page.getByText("Already enrolled",{ exact: true });
    private trainingFullStatus = this.page.locator("span").filter({hasText: "Training is full"});

    async openExploreCourses(): Promise<void> {

        logger.info("Opening Explore Courses");

        const primaryLinkVisible = await this.exploreCoursesLink
            .isVisible({ timeout: 10000 })
            .catch(() => false);

        if (primaryLinkVisible) {
            await this.exploreCoursesLink.click();
        } else {
            logger.info(
                '"Explore Courses" text not found on the dashboard, ' +
                'falling back to "Explore Trainings"'
            );
            await this.exploreTrainingsLink.waitFor({
                state: "visible",
                timeout: 15000
            });
            await this.exploreTrainingsLink.click();
        }

        await expect(this.explorePageHeading).toBeVisible({ timeout: 30000 });

        await this.waitForCoursesToLoad();
    }

    private async clickTab(tab: Locator, tabName: string): Promise<void> {

        logger.info(`Clicking ${tabName} tab`);

        const roleTabVisible = await tab
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        if (roleTabVisible) {
            await tab.click();
        } else {
            await this.page.getByText(tabName, { exact: true }).first().click();
        }

        await this.waitForCoursesToLoad();
    }

    async clickAllTab(): Promise<void> {
        await this.clickTab(this.allTab, "All");
    }

    async clickOpenTab(): Promise<void> {
        await this.clickTab(this.openTab, "Open");
    }

    async clickJoinedTab(): Promise<void> {
        await this.clickTab(this.joinedTab, "Joined");
    }

    async searchCourse(courseName: string): Promise<void> {

        logger.info(`Searching course: ${courseName}`);

        await this.searchInput.waitFor({
            state: "visible",
            timeout: 10000
        });

        await this.searchInput.fill(courseName);

        await this.page.waitForTimeout(1000);
    }

    private getCourse(courseName: string): Locator {

        return this.page.getByText(
            courseName,
            { exact: true }
        ).first();
    }


    async isCourseDisplayed(courseName: string): Promise<boolean> {

        return await this.getCourse(courseName)
            .isVisible()
            .catch(() => false);
    }

    private async getCourseCard(courseName: string): Promise<Locator> {

        const course = this.getCourse(courseName);

        await course.waitFor({
            state: "visible",
            timeout: 10000
        });

        const card = course.locator(
            'xpath=ancestor::*[' +
            './/*[contains(normalize-space(.),"Instructor")]' +
            ' and (' +
            './/button[contains(normalize-space(.),"Join Training")]' +
            ' or .//*[normalize-space(.)="Already enrolled"]' +
            ' or .//*[contains(normalize-space(.),"Training is full")]' +
            ')' +
            '][1]'
        );

        return card;
    }

    async getCourseStatus(courseName: string): Promise<string> {

        const card = await this.getCourseCard(courseName);

        const alreadyEnrolled = card.getByText(
            "Already enrolled",
            { exact: true }
        );

        if (await alreadyEnrolled.isVisible().catch(() => false)) {
            return "Already enrolled";
        }

        const joinTraining = card.locator("button").filter({
            hasText: "Join Training"
        });

        if (await joinTraining.isVisible().catch(() => false)) {
            return "Join Training";
        }

        const trainingFull = card.getByText(
            "Training is full",
            { exact: true }
        );

        if (await trainingFull.isVisible().catch(() => false)) {
            return "Training is full";
        }

        return "Unknown";
    }

    async clickJoinTraining(courseName: string): Promise<void> {

        logger.info(`Clicking Join Training for: ${courseName}`);

        const card = await this.getCourseCard(courseName);

        const joinTraining = card.locator("button").filter({
            hasText: "Join Training"
        }).first();

        await joinTraining.waitFor({
            state: "visible",
            timeout: 10000
        });

        await joinTraining.click();

        await this.waitForCoursesToLoad();
    }

    async verifyAllCourses(): Promise<void> {

        const joinTrainingCount = await this.joinTrainingButtons.count();
        const alreadyEnrolledCount = await this.alreadyEnrolledStatus.count();
        const fullCount = await this.trainingFullStatus.count();

        const totalCourses = joinTrainingCount + alreadyEnrolledCount + fullCount;

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

    async verifyJoinedTabCourses(): Promise<void> {

        await this.waitForCoursesToLoad();

        const alreadyEnrolledCount = await this.alreadyEnrolledStatus.count();
        const joinTrainingCount = await this.joinTrainingButtons.count();
        const fullCount = await this.trainingFullStatus.count();

        logger.info(
            `Joined tab -> Already enrolled: ${alreadyEnrolledCount}, ` +
            `Join Training: ${joinTrainingCount}, ` +
            `Training is full: ${fullCount}`
        );

        expect(
            alreadyEnrolledCount,
            "Joined tab should contain enrolled courses"
        ).toBeGreaterThan(0);

        expect(
            joinTrainingCount,
            "Join Training should not appear in Joined tab"
        ).toBe(0);

        expect(
            fullCount,
            "Training is full should not appear in Joined tab"
        ).toBe(0);
    }

    async verifyOpenTabCourses(): Promise<void> {

        await this.waitForCoursesToLoad();

        const joinTrainingCount = await this.joinTrainingButtons.count();
        const alreadyEnrolledCount = await this.alreadyEnrolledStatus.count();
        const fullCount = await this.trainingFullStatus.count();

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


    async verifyRegisterNotDisplayed(): Promise<void> {

        const registerButton = this.page.getByRole(
            "button",
            { name: /register/i }
        );

        expect(await registerButton.count()).toBe(0);
    }

    private async waitForCoursesToLoad(): Promise<void> {

        await this.page.waitForLoadState("networkidle").catch(() => { });

        await this.page.waitForTimeout(500);
    }


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