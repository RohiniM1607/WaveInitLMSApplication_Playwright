import { expect, Locator } from "@playwright/test";
import { logger } from "../../../main/utils/logger";
import { BasePage } from "../BasePage";

export type TrainingProgramStatus =
    | "Active"
    | "Upcoming"
    | "Completed"
    | "All";

export interface TrainingProgramRowData {
    title: string;
    trainer: string;
    startDate: string;
    endDate: string;
    capacity: string;
}

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

    private editTitleInput = this.page.locator(
    '.reg-modal input.reg-input[type="text"][required]'
);

    private editDescriptionInput = this.page.locator(
    '.reg-modal textarea.reg-input'
);

    private editDateTimeInputs = this.page.locator('input[type="datetime-local"]');

    private editCapacityInput = this.page.getByRole("spinbutton", {
        name: "e.g. 30"
    });

    private saveChangesButton = this.page.getByRole("button", {
        name: "Save Changes"
    });

    private updateError = this.page.getByText(
        "Server error updating training",
        { exact: true }
    );

    private deleteConfirmation = this.page.getByText(
        /Delete training .*\?/,
        { exact: false }
    );

    private deleteWarning = this.page.getByText(
        "This will remove all associated enrollments and feedback.",
        { exact: true }
    );

    private deleteConfirmButton = this.page.getByRole("button", {
        name: "Confirm"
    });

    private deleteSuccess = this.page.getByText(
        "Training deleted successfully",
        { exact: true }
    );

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
        await expect.poll(
            async () => this.getRowsByTitle(query).count(),
            { timeout: 10000 }
        ).toBeGreaterThan(0);
    }

    private getRowsByTitle(title: string): Locator {
        return this.trainingProgramRows.filter({ hasText: title });
    }

    private getRow(data: TrainingProgramRowData): Locator {
    return this.trainingProgramRows.filter({
        hasText: data.title
    });
}

    async expectProgramRowVisible(data: TrainingProgramRowData): Promise<void> {
    logger.info(`Looking for training program: "${data.title}"`);

    const row = this.getRow(data);

    logger.info(`Matching rows found: ${await row.count()}`);

    await expect(row).toHaveCount(1, { timeout: 15000 });

    logger.info(`Training program row found: "${data.title}"`);
}

    async openEditTraining(data: TrainingProgramRowData): Promise<void> {
        const row = this.getRow(data);
        await expect(row).toHaveCount(1, { timeout: 15000 });
        await row.getByRole("button", { name: "Edit Training" }).click();
        await expect(this.saveChangesButton).toBeVisible({ timeout: 10000 });
    }

   async getEditFormValues(): Promise<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    capacity: string;
}> {
    logger.info("EDIT FORM: Reading title");
    const title = await this.editTitleInput.inputValue();

    logger.info(`EDIT FORM: Title = "${title}"`);

    logger.info("EDIT FORM: Reading description");
    const description = await this.editDescriptionInput.inputValue();

    logger.info(`EDIT FORM: Description = "${description}"`);

    logger.info("EDIT FORM: Reading datetime inputs");

    const dateTimeCount = await this.editDateTimeInputs.count();

    logger.info(`EDIT FORM: datetime-local inputs found = ${dateTimeCount}`);

    const startDate = await this.editDateTimeInputs.nth(0).inputValue();

    logger.info(`EDIT FORM: Start date = "${startDate}"`);

    const endDate = await this.editDateTimeInputs.nth(1).inputValue();

    logger.info(`EDIT FORM: End date = "${endDate}"`);

    logger.info("EDIT FORM: Reading capacity");

    const capacity = await this.editCapacityInput.inputValue();

    logger.info(`EDIT FORM: Capacity = "${capacity}"`);

    return {
        title,
        description,
        startDate,
        endDate,
        capacity
    };
}

    async fillEditTraining(values: {
        title?: string;
        description?: string;
        startDate?: string;
        endDate?: string;
        capacity?: string;
    }): Promise<void> {
        if (values.title !== undefined) {
            await this.editTitleInput.fill(values.title);
        }
        if (values.description !== undefined) {
            await this.editDescriptionInput.fill(values.description);
        }
        if (values.startDate !== undefined) {
            await this.editDateTimeInputs.nth(0).fill(values.startDate);
        }
        if (values.endDate !== undefined) {
            await this.editDateTimeInputs.nth(1).fill(values.endDate);
        }
        if (values.capacity !== undefined) {
            await this.editCapacityInput.fill(values.capacity);
        }
    }

    async saveEditedTraining(): Promise<void> {
        await this.saveChangesButton.click();
    }

    async expectEditUpdateError(): Promise<void> {
        await expect(this.updateError).toBeVisible({ timeout: 15000 });
        await expect(this.saveChangesButton).toBeVisible();
    }

    async getTitleValidationMessage(): Promise<string> {
        return this.editTitleInput.evaluate(
            element => (element as HTMLInputElement).validationMessage
        );
    }

    async openDeleteConfirmation(data: TrainingProgramRowData): Promise<void> {
        const row = this.getRow(data);
        await expect(row).toHaveCount(1, { timeout: 15000 });
        await row.getByRole("button", { name: "Delete Training" }).click();
        await expect(this.deleteConfirmation).toBeVisible({ timeout: 10000 });
        await expect(this.deleteWarning).toBeVisible();
    }

    async cancelDelete(): Promise<void> {
        await this.page.getByRole("button", { name: "Cancel" }).last().click();
        await expect(this.deleteConfirmation).toBeHidden();
    }

    async confirmDelete(): Promise<void> {
        await this.deleteConfirmButton.click();
        await expect(this.deleteSuccess).toBeVisible({ timeout: 15000 });
    }

    async expectProgramRowAbsent(data: TrainingProgramRowData): Promise<void> {
        await expect(this.getRow(data)).toHaveCount(0, { timeout: 15000 });
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