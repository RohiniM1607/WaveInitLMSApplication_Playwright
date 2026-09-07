import { expect, Locator } from "@playwright/test";
import { logger } from "../../../main/utils/logger";
import { BasePage } from "../BasePage";

export type TrainingProgramStatus =
    | "Active"
    | "Upcoming"
    | "Completed"
    | "All";

export class TrainingProgramPage extends BasePage {

    private trainingProgramMenu = this.page.getByText(
        "Training Programs",
        { exact: true }
    );

    private statusFilterButtons = {
    Active: this.page.getByRole("button", { name: "Active" }),
    Upcoming: this.page.getByRole("button", { name: "Upcoming" }),
    Completed: this.page.getByRole("button", { name: "Completed" }),
    All: this.page.getByRole("button", { name: "All" })
};

    private trainingProgramRows = this.page.locator("tbody tr");

    private searchInput = this.page.getByRole("textbox", { name: "Search by title or trainer..." });

    async navigateToTrainingProgram(): Promise<void> {

        logger.info("Navigating to the Training Program page");

        await expect(this.trainingProgramMenu).toBeVisible({
            timeout: 15000
        });

        await this.trainingProgramMenu.click();

        await this.waitForTrainingProgramRows();
    }

    private async waitForTrainingProgramRows(): Promise<void> {

        logger.info("Waiting for Training Program table");

        await expect(this.trainingProgramRows.first()).toBeVisible({
            timeout: 15000
        });

        const count = await this.trainingProgramRows.count();

        logger.info(
            `Training program rows loaded: ${count}`
        );
    }

  async selectStatusFilter(
    status: TrainingProgramStatus
): Promise<void> {

    logger.info(`Selecting the "${status}" status filter`);

    const filterButton =
        this.statusFilterButtons[status];

    await expect(filterButton).toBeVisible({
        timeout: 10000
    });

    await expect(filterButton).toBeEnabled({
        timeout: 10000
    });

    await filterButton.click();

    await expect(filterButton).toHaveClass(
        /reg-admin-filter-tab--active/,
        {
            timeout: 5000
        }
    );

    logger.info(`"${status}" filter is active`);

    await expect
        .poll(
            async () => {
                return await this.trainingProgramRows.count();
            },
            {
                timeout: 15000,
                intervals: [250, 500, 1000],
                message:
                    `Training Program rows did not appear after selecting "${status}"`
            }
        )
        .toBeGreaterThan(0);

    if (status !== "All") {
        await this.waitForExpectedStatus(status);
    }

    const count =
        await this.trainingProgramRows.count();

    logger.info(
        `Training program rows after "${status}" filter: ${count}`
    );

    const statuses =
        await this.getAllRowStatuses();

    logger.info(
        `Statuses after "${status}" filter: ${statuses.join(", ")}`
    );
}
private async waitForExpectedStatus(
    expectedStatus: Exclude<TrainingProgramStatus, "All">
): Promise<void> {

    const expected =
        expectedStatus.toUpperCase();

    await expect
        .poll(
            async () => {

                const statuses =
                    await this.getAllRowStatuses();

                if (statuses.length === 0) {
                    return false;
                }

                return statuses.every(
                    status => status === expected
                );
            },
            {
                intervals: [250, 500, 1000, 2000],
                message:
                    `Training Program table did not contain only "${expectedStatus}" rows`
            }
        )
        .toBe(true);
}

    private getStatusCell(row: Locator): Locator {

        /*
         * Status is the 8th column.
         * td.nth(7) = 8th td.
         */
        return row
            .locator("td")
            .nth(7)
            .locator("span")
            .first();
    }

    async getAllRowStatuses(): Promise<string[]> {

        const count =
            await this.trainingProgramRows.count();

        const statuses: string[] = [];

        for (let index = 0; index < count; index++) {

            const row =
                this.trainingProgramRows.nth(index);

            const statusCell =
                this.getStatusCell(row);

            const statusText =
                await statusCell
                    .innerText()
                    .catch(() => "");

            const normalizedStatus =
                statusText
                    .replace(/\s+/g, " ")
                    .trim()
                    .toUpperCase();

            if (normalizedStatus) {
                statuses.push(normalizedStatus);
            }
        }

        logger.info(
            `Row statuses found: ${statuses.join(", ")}`
        );

        return statuses;
    }

    async areAllRowsOfStatus(
        expectedStatus: Exclude<
            TrainingProgramStatus,
            "All"
        >
    ): Promise<boolean> {

        const statuses =
            await this.getAllRowStatuses();

        if (statuses.length === 0) {

            logger.error(
                `No training program statuses found. ` +
                `Expected: ${expectedStatus}`
            );

            return false;
        }

        const expected =
            expectedStatus.toUpperCase();

        const allMatch =
            statuses.every(
                status => status === expected
            );

        if (!allMatch) {

            logger.error(
                `Expected every training program to have status ` +
                `"${expectedStatus}". ` +
                `Actual statuses: ${statuses.join(", ")}`
            );
        }

        return allMatch;
    }

    async listIncludesStatus(
        expectedStatus: Exclude<
            TrainingProgramStatus,
            "All"
        >
    ): Promise<boolean> {

        const statuses =
            await this.getAllRowStatuses();

        if (statuses.length === 0) {

            logger.error(
                `No training program rows found. ` +
                `Expected status: ${expectedStatus}`
            );

            return false;
        }

        return statuses.includes(
            expectedStatus.toUpperCase()
        );
    }

    async listDoesNotIncludeStatus(
        excludedStatus: Exclude<
            TrainingProgramStatus,
            "All"
        >
    ): Promise<boolean> {

        const statuses =
            await this.getAllRowStatuses();

        /*
         * Empty table must fail.
         * Otherwise an empty result would incorrectly pass
         * the "does not include" validation.
         */
        if (statuses.length === 0) {

            logger.error(
                `No training program rows found while checking ` +
                `excluded status "${excludedStatus}"`
            );

            return false;
        }

        return !statuses.includes(
            excludedStatus.toUpperCase()
        );
    }

    async listIncludesAllStatuses(
        expectedStatuses: string[]
    ): Promise<boolean> {

        const actualStatuses =
            await this.getAllRowStatuses();

        if (actualStatuses.length === 0) {

            logger.error(
                "No training program rows found while validating All filter"
            );

            return false;
        }

        const normalizedActual =
            actualStatuses.map(
                status => status.toUpperCase()
            );

        const missingStatuses =
            expectedStatuses.filter(
                status =>
                    !normalizedActual.includes(
                        status.toUpperCase()
                    )
            );

        if (missingStatuses.length > 0) {

            logger.error(
                `Missing statuses: ${missingStatuses.join(", ")}. ` +
                `Actual statuses: ${actualStatuses.join(", ")}`
            );

            return false;
        }

        return true;
    }

    // ---------------------------------------------------------------------
    // Add Training / search verification support
    // ---------------------------------------------------------------------

    async searchTrainingProgram(query: string): Promise<void> {
        logger.info(`Searching training programs for "${query}"`);
        await this.fill(this.searchInput, query);
        await this.page.waitForTimeout(500);
    }

    private getRowsByTitle(title: string): Locator {
        return this.trainingProgramRows.filter({ hasText: title });
    }

    async getRowCountByTitle(title: string): Promise<number> {
        return await this.getRowsByTitle(title).count();
    }

    private parseDisplayedDate(text: string): Date | null {
        const monthMap: Record<string, number> = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
        };

        const match = text.trim().match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
        if (!match) {
            return null;
        }

        const day = parseInt(match[1], 10);
        const monthKey = match[2].toLowerCase();
        const year = parseInt(match[3], 10);

        if (!(monthKey in monthMap)) {
            return null;
        }

        return new Date(year, monthMap[monthKey], day);
    }

    private isSameCalendarDate(displayedText: string, expected: Date): boolean {
        const parsed = this.parseDisplayedDate(displayedText);
        if (!parsed) {
            return false;
        }
        return (
            parsed.getFullYear() === expected.getFullYear() &&
            parsed.getMonth() === expected.getMonth() &&
            parsed.getDate() === expected.getDate()
        );
    }

    /**
     * Compares the first row matching the given title against the details
     * that were entered when the training session was created.
     */
    async doesRowMatchDetails(input: {
        title: string;
        trainerName: string;
        capacity: string;
        startDate: Date;
        endDate: Date;
    }): Promise<boolean> {
        const row = this.getRowsByTitle(input.title).first();

        if (!(await row.isVisible().catch(() => false))) {
            logger.error(`No row found for title "${input.title}"`);
            return false;
        }

        const cells = row.locator("td");
        const trainerText = (await cells.nth(2).innerText()).trim();
        const startDateText = (await cells.nth(3).innerText()).trim();
        const endDateText = (await cells.nth(4).innerText()).trim();
        const capacityText = (await cells.nth(5).innerText()).trim();

        const trainerMatches = trainerText.toLowerCase().includes(input.trainerName.toLowerCase());
        const capacityMatches = capacityText === input.capacity;
        const startDateMatches = this.isSameCalendarDate(startDateText, input.startDate);
        const endDateMatches = this.isSameCalendarDate(endDateText, input.endDate);

        if (!trainerMatches || !capacityMatches || !startDateMatches || !endDateMatches) {
            logger.error(
                `Row mismatch for "${input.title}". ` +
                `Trainer: expected match for "${input.trainerName}" got "${trainerText}". ` +
                `Capacity: expected "${input.capacity}" got "${capacityText}". ` +
                `Start date valid: ${startDateMatches} ("${startDateText}"). ` +
                `End date valid: ${endDateMatches} ("${endDateText}").`
            );
        }

        return trainerMatches && capacityMatches && startDateMatches && endDateMatches;
    }
}