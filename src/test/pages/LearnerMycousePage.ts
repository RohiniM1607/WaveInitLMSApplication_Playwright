import { expect } from "@playwright/test";
import { logger } from "../../main/utils/logger";
import { BasePage } from "../pages/BasePage";

export type SortOption = "newest" | "oldest" | "title";

export class LearnerMyCoursesPage extends BasePage {

    private myCoursesNavLink =
        this.page.locator('span:has-text("My Courses")').first();

    private myCoursesHeading =
        this.page.getByRole("heading", {
            name: "My Courses",
            exact: true
        });

    private searchInput =
        this.page.getByRole("textbox", {
            name: "Search courses by title..."
        });

    private sortSelect =
        this.page.locator("select.tmt-select").last();

    private coursesTable =
        this.page.locator("table.tmt-table");

    /*
     * Important:
     * Do NOT use getByRole("heading") for course titles.
     * The course title is a normal element inside the first table cell.
     */
    private courseRows =
        this.coursesTable.locator("tbody tr");

    private noCoursesMessage =
        this.page.getByText(
            "No courses found matching your criteria",
            {
                exact: true
            }
        );

    async openMyCourses(): Promise<void> {

        logger.info("Opening My Courses from the sidebar");

        await expect(this.myCoursesNavLink).toBeVisible({
            timeout: 30000
        });

        await this.myCoursesNavLink.click();

        await expect(this.myCoursesHeading).toBeVisible({
            timeout: 30000
        });

        await expect(this.searchInput).toBeVisible({
            timeout: 30000
        });

        await expect(this.sortSelect).toBeVisible({
            timeout: 30000
        });

        /*
         * Wait until the course table is rendered.
         */
        await expect(this.coursesTable).toBeVisible({
            timeout: 30000
        });
    }

    async searchCourse(courseName: string): Promise<void> {

        logger.info(`Searching course: ${courseName}`);

        await expect(this.searchInput).toBeVisible({
            timeout: 10000
        });

        await this.searchInput.fill("");

        await this.searchInput.fill(courseName);

        /*
         * Wait for the UI to process the search.
         * Do not use an arbitrary 1 second wait as the main synchronization.
         */
        await this.page.waitForTimeout(500);

        logger.info(`Search completed for: ${courseName}`);
    }

    /**
     * Returns all currently displayed course rows.
     */
    async getCourseRowCount(): Promise<number> {

        return await this.courseRows.count();
    }

    /**
     * Gets the course title from one row.
     *
     * The first TD contains the course information.
     * We look for the actual visible course-title element
     * instead of depending on accessibility role="heading".
     */
    private async getCourseNameFromRow(rowIndex: number): Promise<string> {

        const row = this.courseRows.nth(rowIndex);

        const firstCell = row.locator("td").first();

        /*
         * Try semantic heading first.
         */
        const heading = firstCell.locator("h1, h2, h3, h4, h5, h6").first();

        if (await heading.count() > 0) {

            const headingText =
                (await heading.textContent())?.trim();

            if (headingText) {
                return headingText;
            }
        }

        /*
         * Fallback:
         * Find a direct visible text element that represents
         * the course title.
         *
         * We remove known UI labels such as COURSE.
         */
        const textElements =
            firstCell.locator("div, span, p, a");

        const count = await textElements.count();

        for (let i = 0; i < count; i++) {

            const element = textElements.nth(i);

            if (!(await element.isVisible().catch(() => false))) {
                continue;
            }

            const text =
                (await element.textContent())?.trim();

            if (!text) {
                continue;
            }

            if (text === "COURSE") {
                continue;
            }

            /*
             * Ignore the description.
             * Course title should normally be a short text value.
             */
            if (
                text.length > 80 ||
                text.toLowerCase().startsWith("learn ")
            ) {
                continue;
            }

            return text;
        }

        return "";
    }

    /**
     * Returns course names in the exact order displayed in UI.
     */
    async getAllCourseNames(): Promise<string[]> {

        const count =
            await this.courseRows.count();

        const names: string[] = [];

        for (let i = 0; i < count; i++) {

            const name =
                await this.getCourseNameFromRow(i);

            if (name) {
                names.push(name);
            }
        }

        logger.info(
            `Courses displayed: ${names.join(" -> ")}`
        );

        return names;
    }

    /**
     * Checks whether a particular course is displayed.
     */
    async isCourseVisible(courseName: string): Promise<boolean> {

        const names =
            await this.getAllCourseNames();

        return names.some(
            name =>
                name.trim().toLowerCase() ===
                courseName.trim().toLowerCase()
        );
    }

    /**
     * Checks that exactly one course is displayed
     * and that it is the expected course.
     */
    async verifyOnlyCourseDisplayed(
        courseName: string
    ): Promise<void> {

        const names =
            await this.getAllCourseNames();

        expect(
            names,
            `Expected only "${courseName}" to be displayed`
        ).toEqual([courseName]);
    }

    /**
     * Checks the no-result state.
     */
    async isNoCoursesMessageVisible(): Promise<boolean> {

        return await this.noCoursesMessage
            .isVisible()
            .catch(() => false);
    }

    /**
     * Verifies that no course rows exist.
     */
    async verifyNoCoursesDisplayed(): Promise<void> {

        const rowCount =
            await this.getCourseRowCount();

        expect(
            rowCount,
            "No course rows should be displayed for an invalid search"
        ).toBe(0);
    }

    /**
     * Selects sorting option.
     */
    async sortBy(option: SortOption): Promise<void> {

        logger.info(`Sorting courses by: ${option}`);

        await expect(this.sortSelect).toBeVisible({
            timeout: 10000
        });

        await this.sortSelect.selectOption(option);

        /*
         * Wait for React/UI rendering to complete.
         */
        await this.page.waitForTimeout(500);

        logger.info(`Sort option selected: ${option}`);
    }

    /**
     * Returns the selected sort option.
     */
    async getSelectedSortOption(): Promise<string> {

        return await this.sortSelect.inputValue();
    }
}