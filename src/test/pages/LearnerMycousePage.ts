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
     * Loading message displayed while courses are being fetched.
     */
    private loadingMessage =
        this.page.getByText(
            "Loading your assigned courses...",
            {
                exact: true
            }
        );

    /*
     * Message displayed when the search returns no courses.
     */
    private noCoursesMessage =
        this.page.getByText(
            "No courses found matching your criteria",
            {
                exact: true
            }
        );

    /*
     * Course table rows.
     */
    private courseRows =
        this.coursesTable.locator("tbody tr");


    /* =========================================================
       OPEN MY COURSES
       ========================================================= */

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

        await expect(this.coursesTable).toBeVisible({
            timeout: 30000
        });

        /*
         * Wait for initial course loading to finish.
         */
        await this.waitForCourseLoadingToFinish();

        logger.info("My Courses page loaded successfully");
    }


    /* =========================================================
       WAIT FOR COURSE LOADING
       ========================================================= */

    private async waitForCourseLoadingToFinish(): Promise<void> {

        /*
         * If the loading message exists, wait until it disappears.
         *
         * We first check whether it is visible so we do not
         * unnecessarily wait when the application has already
         * completed loading.
         */
        const loadingVisible =
            await this.loadingMessage
                .isVisible()
                .catch(() => false);

        if (loadingVisible) {

            logger.info(
                "Course loading detected. Waiting for loading to finish..."
            );

            await expect(this.loadingMessage).toBeHidden({
                timeout: 30000
            });

            logger.info(
                "Course loading completed"
            );
        }
    }


    /* =========================================================
       SEARCH COURSE
       ========================================================= */

    async searchCourse(courseName: string): Promise<void> {

        logger.info(`Searching course: ${courseName}`);

        await expect(this.searchInput).toBeVisible({
            timeout: 10000
        });

        /*
         * Clear the existing search value.
         */
        await this.searchInput.fill("");

        /*
         * Enter the requested course.
         */
        await this.searchInput.fill(courseName);

        /*
         * IMPORTANT:
         * Do not use a fixed wait such as:
         *
         * await page.waitForTimeout(500);
         *
         * The application may take more or less time to update.
         *
         * Wait for the actual loading state instead.
         */
        await this.waitForCourseLoadingToFinish();

        /*
         * Give React/UI a chance to commit the final DOM state
         * only when the loading indicator is not present.
         *
         * This is not used as the primary synchronization.
         */
        await expect(async () => {

            const loadingVisible =
                await this.loadingMessage
                    .isVisible()
                    .catch(() => false);

            expect(
                loadingVisible,
                "Course list is still loading"
            ).toBe(false);

        }).toPass({
            timeout: 30000,
            intervals: [100, 250, 500]
        });

        logger.info(`Search completed for: ${courseName}`);
    }


    /* =========================================================
       COURSE ROW COUNT
       ========================================================= */

    async getCourseRowCount(): Promise<number> {

        return await this.courseRows.count();
    }


    /* =========================================================
       GET COURSE NAME FROM ROW
       ========================================================= */

    private async getCourseNameFromRow(
        rowIndex: number
    ): Promise<string> {

        const row =
            this.courseRows.nth(rowIndex);

        const firstCell =
            row.locator("td").first();

        /*
         * Try semantic heading first.
         */
        const heading =
            firstCell
                .locator("h1, h2, h3, h4, h5, h6")
                .first();

        if (await heading.count() > 0) {

            const headingText =
                (await heading.textContent())?.trim();

            if (headingText) {
                return headingText;
            }
        }

        /*
         * Fallback to visible text elements.
         */
        const textElements =
            firstCell.locator("div, span, p, a");

        const count =
            await textElements.count();

        for (let i = 0; i < count; i++) {

            const element =
                textElements.nth(i);

            if (
                !(await element
                    .isVisible()
                    .catch(() => false))
            ) {
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
             * Ignore descriptions and long text.
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


    /* =========================================================
       GET ALL COURSE NAMES
       ========================================================= */

    async getAllCourseNames(): Promise<string[]> {

        /*
         * Make sure the loading state has finished before
         * reading the rows.
         */
        await this.waitForCourseLoadingToFinish();

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


    /* =========================================================
       CHECK COURSE VISIBILITY
       ========================================================= */

    async isCourseVisible(
        courseName: string
    ): Promise<boolean> {

        /*
         * Wait for loading to finish before checking the
         * course list.
         */
        await this.waitForCourseLoadingToFinish();

        /*
         * If no-course message is displayed, the course
         * obviously cannot be present.
         */
        const noCoursesVisible =
            await this.noCoursesMessage
                .isVisible()
                .catch(() => false);

        if (noCoursesVisible) {
            return false;
        }

        const names =
            await this.getAllCourseNames();

        return names.some(
            name =>
                name.trim().toLowerCase() ===
                courseName.trim().toLowerCase()
        );
    }


    /* =========================================================
       VERIFY ONLY EXPECTED COURSE
       ========================================================= */

    async verifyOnlyCourseDisplayed(
        courseName: string
    ): Promise<void> {

        await this.waitForCourseLoadingToFinish();

        const names =
            await this.getAllCourseNames();

        expect(
            names,
            `Expected only "${courseName}" to be displayed`
        ).toEqual([courseName]);
    }


    /* =========================================================
       NO COURSE MESSAGE
       ========================================================= */

    async isNoCoursesMessageVisible(): Promise<boolean> {

        await this.waitForCourseLoadingToFinish();

        return await this.noCoursesMessage
            .isVisible()
            .catch(() => false);
    }


    /* =========================================================
       VERIFY NO COURSES
       ========================================================= */

    async verifyNoCoursesDisplayed(): Promise<void> {

        await this.waitForCourseLoadingToFinish();

        const rowCount =
            await this.getCourseRowCount();

        expect(
            rowCount,
            "No course rows should be displayed for an invalid search"
        ).toBe(0);
    }


    /* =========================================================
       SORT COURSES
       ========================================================= */

    async sortBy(
        option: SortOption
    ): Promise<void> {

        logger.info(
            `Sorting courses by: ${option}`
        );

        await expect(this.sortSelect).toBeVisible({
            timeout: 10000
        });

        await this.sortSelect.selectOption(option);

        /*
         * Wait for any loading triggered by sorting.
         */
        await this.waitForCourseLoadingToFinish();

        logger.info(
            `Sort option selected: ${option}`
        );
    }


    /* =========================================================
       GET SELECTED SORT
       ========================================================= */

    async getSelectedSortOption(): Promise<string> {

        return await this.sortSelect.inputValue();
    }
}