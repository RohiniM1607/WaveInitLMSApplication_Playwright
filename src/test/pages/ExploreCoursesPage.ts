import { expect, Locator } from "playwright/test";
import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class ExploreCoursesPage extends BasePage {

    private exploreCoursesLink = this.page.getByText('Explore Courses', { exact: true }).first();
    private availableTab = this.page.getByText('Available', { exact: true }).first();

    // Every course card has an "Open" action - used as the anchor to find the card boundary
    private openButtons = this.page.getByRole('button', { name: 'Open', exact: true });

    // Wording is matched loosely (Register / Join) since the exact label on the
    // course-details view was not confirmed against the live app.
    private registerButton = this.page.getByRole('button', { name: /^(register|join)$/i }).first();
    private alreadyJoinedStatus = this.page.getByText('Already Joined', { exact: true });
    private fullStatus = this.page.getByText('Full', { exact: true });

    async openExploreCourses() {
        logger.info("Opening Explore Courses from the dashboard");
        await this.click(this.exploreCoursesLink);
    }

    async isOnAvailableTab(timeout = 15000): Promise<boolean> {
        try {
            await expect(this.availableTab).toBeVisible({ timeout });
            return true;
        } catch {
            return false;
        }
    }

    async getCourseCardCount(): Promise<number> {
        await this.openButtons.first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => { });
        return await this.openButtons.count();
    }

    // Card boundary = the closest container above the "Open" button that also
    // holds the course's status text (Join / Already Joined / Full)
    private getCourseCard(index: number): Locator {
        return this.openButtons.nth(index).locator(
            'xpath=ancestor::*[self::div or self::li or self::article]' +
            '[.//*[normalize-space(text())="Join" or normalize-space(text())="Already Joined" or normalize-space(text())="Full"]][1]'
        );
    }

    async getCourseStatus(index: number): Promise<string> {
        const card = this.getCourseCard(index);

        if (await card.getByText('Already Joined', { exact: true }).isVisible().catch(() => false)) {
            return 'Already Joined';
        }
        if (await card.getByText('Full', { exact: true }).isVisible().catch(() => false)) {
            return 'Full';
        }
        if (await card.getByText('Join', { exact: true }).isVisible().catch(() => false)) {
            return 'Join';
        }
        return 'Unknown';
    }

    async openFirstCourseWithStatus(status: string) {
        const count = await this.getCourseCardCount();
        for (let i = 0; i < count; i++) {
            const cardStatus = await this.getCourseStatus(i);
            if (cardStatus === status) {
                logger.info(`Opening course card #${i} with status "${status}"`);
                await this.click(this.openButtons.nth(i));
                return;
            }
        }
        throw new Error(`No course card with status "${status}" was found on the Available tab`);
    }

    async isRegisterButtonVisible(timeout = 10000): Promise<boolean> {
        try {
            await expect(this.registerButton).toBeVisible({ timeout });
            return true;
        } catch {
            return false;
        }
    }

    async isRegisterButtonHidden(timeout = 5000): Promise<boolean> {
        try {
            await expect(this.registerButton).toBeHidden({ timeout });
            return true;
        } catch {
            return false;
        }
    }

    async clickRegisterButton() {
        logger.info("Clicking the Register button on the course details");
        await this.click(this.registerButton);
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    async isAlreadyJoinedVisible(timeout = 10000): Promise<boolean> {
        try {
            await expect(this.alreadyJoinedStatus.first()).toBeVisible({ timeout });
            return true;
        } catch {
            return false;
        }
    }

    async isFullStatusVisible(timeout = 10000): Promise<boolean> {
        try {
            await expect(this.fullStatus.first()).toBeVisible({ timeout });
            return true;
        } catch {
            return false;
        }
    }
}