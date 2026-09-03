import { expect, Locator } from "@playwright/test";
import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

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
}