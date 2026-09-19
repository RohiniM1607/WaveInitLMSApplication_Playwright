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

export interface TrainingProgramEditFormValues {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    capacity: string;
}

export interface TrainingProgramEditFormInput {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    capacity?: string;
}

export class TrainingProgramPage extends BasePage {

    private readonly ACTION_TIMEOUT = 60_000;
    private readonly TABLE_TIMEOUT = 30_000;

    // ---------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------

    private trainingProgramMenu = this.page.getByText(
        "Training Programs",
        { exact: true }
    );

    // ---------------------------------------------------------------------
    // Status filters
    // ---------------------------------------------------------------------

    private statusFilterButtons = {
        Active: this.page.locator(
            'button.reg-admin-filter-tab',
            { hasText: "Active" }
        ),
        Upcoming: this.page.locator(
            'button.reg-admin-filter-tab',
            { hasText: "Upcoming" }
        ),
        Completed: this.page.locator(
            'button.reg-admin-filter-tab',
            { hasText: "Completed" }
        ),
        All: this.page.locator(
            'button.reg-admin-filter-tab',
            { hasText: "All" }
        )
    };

    // ---------------------------------------------------------------------
    // Table
    // ---------------------------------------------------------------------

    private trainingProgramRows =
        this.page.locator("tbody tr");

    private searchInput =
        this.page.getByRole("textbox", {
            name: "Search by title or trainer..."
        });

    // ---------------------------------------------------------------------
    // Edit / Delete
    // ---------------------------------------------------------------------

    private editButtonInRow = (title: string): Locator =>
        this.getRowsByTitle(title)
            .first()
            .locator('button[title="Edit"]');

    private deleteButtonInRow = (title: string): Locator =>
        this.getRowsByTitle(title)
            .first()
            .locator('button[title="Delete"]');

    // ---------------------------------------------------------------------
    // Edit form
    // ---------------------------------------------------------------------

    private editTitleInput =
        this.page.getByRole("textbox", {
            name: "e.g. React Fundamentals"
        });

    private editDescriptionInput =
        this.page.getByRole("textbox", {
            name: "Training objectives and content overview..."
        });

    private editDateTimeInputs =
        this.page.locator('input[type="datetime-local"]');

    private editCapacityInput =
        this.page.getByRole("spinbutton", {
            name: "e.g. 30"
        });

    private saveChangesButton =
        this.page.getByRole("button", {
            name: "Save Changes",
            exact: true
        });

    private editUpdateErrorMessage =
        this.page
            .locator(
                '[role="alert"], .toast-error, .cdb-toast--error'
            )
            .filter({
                hasText: /error|failed|unable/i
            });

    // ---------------------------------------------------------------------
    // Delete confirmation
    // ---------------------------------------------------------------------

    private deleteConfirmationHeading = (
        title: string
    ): Locator =>
        this.page.getByText(
            `Delete training "${title}"?`,
            { exact: true }
        );

    private deleteConfirmationModal =
        this.page
            .getByText(
                "This will remove all associated enrollments and feedback.",
                { exact: true }
            )
            .locator(
                'xpath=ancestor::*[self::div][.//button][1]'
            );

    // ---------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------

    async navigateToTrainingProgram(): Promise<void> {

        logger.info(
            "Navigating to the Training Program page"
        );

        await this.dismissCookieConsentIfPresent();

        await expect(this.trainingProgramMenu).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await this.trainingProgramMenu.click({
            timeout: this.ACTION_TIMEOUT
        });

        await this.dismissCookieConsentIfPresent();

        await this.waitForTrainingProgramTable();

        logger.info(
            "Training Program page opened successfully"
        );
    }

    private async waitForTrainingProgramTable(): Promise<void> {

        logger.info(
            "Waiting for Training Program table"
        );

        await expect(this.trainingProgramRows.first())
            .toBeVisible({
                timeout: this.TABLE_TIMEOUT
            });

        logger.info(
            `Training program rows loaded: ${
                await this.trainingProgramRows.count()
            }`
        );
    }

    // ---------------------------------------------------------------------
    // Status filter
    // ---------------------------------------------------------------------

    async selectStatusFilter(
        status: TrainingProgramStatus
    ): Promise<void> {

        logger.info(
            `Selecting the "${status}" status filter`
        );

        const filterButton =
            this.statusFilterButtons[status];

        await expect(filterButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(filterButton).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await filterButton.click({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(filterButton).toHaveClass(
            /reg-admin-filter-tab--active/,
            {
                timeout: 10_000
            }
        );

        logger.info(
            `"${status}" filter is active`
        );

        await expect
            .poll(
                async () => {
                    return await this.trainingProgramRows.count();
                },
                {
                    timeout: this.ACTION_TIMEOUT,
                    intervals: [250, 500, 1000, 2000],
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

        const statuses =
            await this.getAllRowStatuses();

        logger.info(
            `Training program rows after "${status}" filter: ${count}`
        );

        logger.info(
            `Statuses after "${status}" filter: ${
                statuses.join(", ")
            }`
        );
    }

    private async waitForExpectedStatus(
        expectedStatus:
            Exclude<TrainingProgramStatus, "All">
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
                        status =>
                            status === expected
                    );
                },
                {
                    timeout: this.ACTION_TIMEOUT,
                    intervals: [
                        250,
                        500,
                        1000,
                        2000
                    ],
                    message:
                        `Training Program table did not contain only "${expectedStatus}" rows`
                }
            )
            .toBe(true);
    }

    // ---------------------------------------------------------------------
    // Status extraction
    // ---------------------------------------------------------------------

    private getStatusCell(row: Locator): Locator {

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

        for (
            let index = 0;
            index < count;
            index++
        ) {

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
                statuses.push(
                    normalizedStatus
                );
            }
        }

        logger.info(
            `Row statuses found: ${
                statuses.join(", ")
            }`
        );

        return statuses;
    }

    async areAllRowsOfStatus(
        expectedStatus:
            Exclude<TrainingProgramStatus, "All">
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

        const result =
            statuses.every(
                status =>
                    status === expected
            );

        if (!result) {

            logger.error(
                `Expected every training program to have ` +
                `status "${expectedStatus}". ` +
                `Actual statuses: ${statuses.join(", ")}`
            );
        }

        return result;
    }

    async listIncludesStatus(
        expectedStatus:
            Exclude<TrainingProgramStatus, "All">
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
        excludedStatus:
            Exclude<TrainingProgramStatus, "All">
    ): Promise<boolean> {

        const statuses =
            await this.getAllRowStatuses();

        if (statuses.length === 0) {

            logger.error(
                `No training program rows found while ` +
                `checking excluded status "${excludedStatus}"`
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
                "No training program rows found while " +
                "validating All filter"
            );

            return false;
        }

        const normalizedActual =
            actualStatuses.map(
                status =>
                    status.toUpperCase()
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
                `Missing statuses: ${
                    missingStatuses.join(", ")
                }. Actual statuses: ${
                    actualStatuses.join(", ")
                }`
            );

            return false;
        }

        return true;
    }

    // ---------------------------------------------------------------------
    // Search
    // ---------------------------------------------------------------------

    async searchTrainingProgram(
        query: string
    ): Promise<void> {

        logger.info(
            `Searching training programs for "${query}"`
        );

        await expect(this.searchInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await this.searchInput.fill(query);

        /*
         * Wait for the UI to apply the search.
         * Do not use a fixed long wait.
         */
        await this.page.waitForTimeout(500);

        logger.info(
            `Training program search completed for "${query}"`
        );
    }

    private getRowsByTitle(
        title: string
    ): Locator {

        /*
         * Use exact text matching for the title.
         *
         * hasText(title) can match unintended rows when one
         * title is contained inside another title.
         */
        return this.trainingProgramRows.filter({
            has: this.page.getByText(
                title,
                { exact: true }
            )
        });
    }

    async getRowCountByTitle(
        title: string
    ): Promise<number> {

        return await this
            .getRowsByTitle(title)
            .count();
    }

    /**
     * Makes sure the requested training program can be found.
     *
     * The important fix is that Edit/Delete no longer assumes
     * the target row is immediately visible in the current table.
     */
    private async ensureProgramRowVisible(
        target: TrainingProgramRowData
    ): Promise<Locator> {

        logger.info(
            `Looking for training program "${target.title}"`
        );

        let row =
            this.getRowsByTitle(target.title)
                .first();

        /*
         * First check the currently displayed rows.
         */
        if (
            await row
                .isVisible()
                .catch(() => false)
        ) {

            logger.info(
                `Training program "${target.title}" ` +
                `is already visible`
            );

            return row;
        }

        /*
         * If not visible, use the page search.
         */
        await expect(this.searchInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await this.searchInput.fill(
            target.title
        );

        /*
         * Wait until the search result appears.
         */
        await expect
            .poll(
                async () => {

                    row =
                        this.getRowsByTitle(
                            target.title
                        ).first();

                    return await row
                        .isVisible()
                        .catch(() => false);
                },
                {
                    timeout: this.ACTION_TIMEOUT,
                    intervals: [
                        250,
                        500,
                        1000,
                        2000
                    ],
                    message:
                        `Training program "${target.title}" ` +
                        `was not found in the Training Program table`
                }
            )
            .toBe(true);

        logger.info(
            `Training program "${target.title}" ` +
            `found successfully`
        );

        return row;
    }

    // ---------------------------------------------------------------------
    // Date helpers
    // ---------------------------------------------------------------------

    private parseDisplayedDate(
        text: string
    ): Date | null {

        const monthMap: Record<string, number> = {
            jan: 0,
            feb: 1,
            mar: 2,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            aug: 7,
            sep: 8,
            sept: 8,
            oct: 9,
            nov: 10,
            dec: 11
        };

        const match =
            text
                .trim()
                .match(
                    /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/
                );

        if (!match) {
            return null;
        }

        const day =
            parseInt(match[1], 10);

        const monthKey =
            match[2].toLowerCase();

        const year =
            parseInt(match[3], 10);

        if (!(monthKey in monthMap)) {
            return null;
        }

        return new Date(
            year,
            monthMap[monthKey],
            day
        );
    }

    private isSameCalendarDate(
        displayedText: string,
        expected: Date
    ): boolean {

        const parsed =
            this.parseDisplayedDate(
                displayedText
            );

        if (!parsed) {
            return false;
        }

        return (
            parsed.getFullYear() ===
                expected.getFullYear() &&
            parsed.getMonth() ===
                expected.getMonth() &&
            parsed.getDate() ===
                expected.getDate()
        );
    }

    // ---------------------------------------------------------------------
    // Add Training verification support
    // ---------------------------------------------------------------------

    async doesRowMatchDetails(input: {
        title: string;
        trainerName: string;
        capacity: string;
        startDate: Date;
        endDate: Date;
    }): Promise<boolean> {

        const row =
            this.getRowsByTitle(
                input.title
            ).first();

        if (
            !(await row
                .isVisible()
                .catch(() => false))
        ) {

            logger.error(
                `No row found for title "${input.title}"`
            );

            return false;
        }

        const cells =
            row.locator("td");

        const trainerText =
            (
                await cells
                    .nth(2)
                    .innerText()
            ).trim();

        const startDateText =
            (
                await cells
                    .nth(3)
                    .innerText()
            ).trim();

        const endDateText =
            (
                await cells
                    .nth(4)
                    .innerText()
            ).trim();

        const capacityText =
            (
                await cells
                    .nth(5)
                    .innerText()
            ).trim();

        const trainerMatches =
            trainerText
                .toLowerCase()
                .includes(
                    input.trainerName
                        .toLowerCase()
                );

        const capacityMatches =
            capacityText ===
            input.capacity;

        const startDateMatches =
            this.isSameCalendarDate(
                startDateText,
                input.startDate
            );

        const endDateMatches =
            this.isSameCalendarDate(
                endDateText,
                input.endDate
            );

        if (
            !trainerMatches ||
            !capacityMatches ||
            !startDateMatches ||
            !endDateMatches
        ) {

            logger.error(
                `Row mismatch for "${input.title}". ` +
                `Trainer: expected "${input.trainerName}" ` +
                `got "${trainerText}". ` +
                `Capacity: expected "${input.capacity}" ` +
                `got "${capacityText}". ` +
                `Start date valid: ${startDateMatches} ` +
                `("${startDateText}"). ` +
                `End date valid: ${endDateMatches} ` +
                `("${endDateText}").`
            );
        }

        return (
            trainerMatches &&
            capacityMatches &&
            startDateMatches &&
            endDateMatches
        );
    }

    // ---------------------------------------------------------------------
    // Edit
    // ---------------------------------------------------------------------

    async expectProgramRowVisible(
        target: TrainingProgramRowData
    ): Promise<void> {

        logger.info(
            `Verifying training program row is visible: ` +
            `"${target.title}"`
        );

        await this.ensureProgramRowVisible(
            target
        );

        logger.info(
            `Training program row "${target.title}" ` +
            `is visible`
        );
    }

    async expectProgramRowAbsent(
        target: TrainingProgramRowData
    ): Promise<void> {

        logger.info(
            `Verifying training program row is absent: ` +
            `"${target.title}"`
        );

        /*
         * Clear the search first so the entire table can be checked.
         */
        if (
            await this.searchInput
                .isVisible()
                .catch(() => false)
        ) {

            await this.searchInput.fill("");

            await this.page.waitForTimeout(500);
        }

        await expect(
            this.getRowsByTitle(
                target.title
            )
        ).toHaveCount(0, {
            timeout: this.ACTION_TIMEOUT
        });

        logger.info(
            `Training program row "${target.title}" ` +
            `is absent`
        );
    }

    async openEditTraining(
        target: TrainingProgramRowData
    ): Promise<void> {

        logger.info(
            `Opening Edit for training program ` +
            `"${target.title}"`
        );

        /*
         * IMPORTANT:
         * Locate the row first.
         */
        const row =
            await this.ensureProgramRowVisible(
                target
            );

        /*
         * Locate the Edit button only inside
         * the correct row.
         */
        const editButton =
            row.locator(
                'button[title="Edit"]'
            ).first();

        await expect(editButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(editButton).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await editButton.click({
            timeout: this.ACTION_TIMEOUT
        });

        /*
         * Wait for Edit form.
         */
        await expect(
            this.editTitleInput
        ).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(
            this.saveChangesButton
        ).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        logger.info(
            "Edit Training form opened successfully"
        );
    }

    async getEditFormValues(): Promise<TrainingProgramEditFormValues> {

        await expect(
            this.editTitleInput
        ).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        const title =
            await this.editTitleInput
                .inputValue();

        const description =
            await this.editDescriptionInput
                .inputValue()
                .catch(() => "");

        const startDate =
            await this.editDateTimeInputs
                .nth(0)
                .inputValue();

        const endDate =
            await this.editDateTimeInputs
                .nth(1)
                .inputValue();

        const capacity =
            await this.editCapacityInput
                .inputValue();

        return {
            title,
            description,
            startDate,
            endDate,
            capacity
        };
    }

    async fillEditTraining(
        input: TrainingProgramEditFormInput
    ): Promise<void> {

        logger.info(
            "Filling Edit Training form fields"
        );

        if (
            input.title !== undefined
        ) {

            await expect(
                this.editTitleInput
            ).toBeVisible({
                timeout: this.ACTION_TIMEOUT
            });

            await this.editTitleInput.fill(
                input.title,
                {
                    timeout:
                        this.ACTION_TIMEOUT
                }
            );
        }

        if (
            input.description !== undefined
        ) {

            await expect(
                this.editDescriptionInput
            ).toBeVisible({
                timeout: this.ACTION_TIMEOUT
            });

            await this.editDescriptionInput.fill(
                input.description,
                {
                    timeout:
                        this.ACTION_TIMEOUT
                }
            );
        }

        if (
            input.startDate !== undefined
        ) {

            const startDateInput =
                this.editDateTimeInputs
                    .nth(0);

            await expect(
                startDateInput
            ).toBeVisible({
                timeout:
                    this.ACTION_TIMEOUT
            });

            await startDateInput.fill(
                input.startDate,
                {
                    timeout:
                        this.ACTION_TIMEOUT
                }
            );
        }

        if (
            input.endDate !== undefined
        ) {

            const endDateInput =
                this.editDateTimeInputs
                    .nth(1);

            await expect(
                endDateInput
            ).toBeVisible({
                timeout:
                    this.ACTION_TIMEOUT
            });

            await endDateInput.fill(
                input.endDate,
                {
                    timeout:
                        this.ACTION_TIMEOUT
                }
            );
        }

        if (
            input.capacity !== undefined
        ) {

            await expect(
                this.editCapacityInput
            ).toBeVisible({
                timeout:
                    this.ACTION_TIMEOUT
            });

            await this.editCapacityInput.fill(
                input.capacity,
                {
                    timeout:
                        this.ACTION_TIMEOUT
                }
            );
        }
    }

    async saveEditedTraining(): Promise<void> {

        logger.info(
            "Saving edited training program"
        );

        await expect(
            this.saveChangesButton
        ).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(
            this.saveChangesButton
        ).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await this.saveChangesButton.click({
            timeout: this.ACTION_TIMEOUT
        });

        logger.info(
            "Edit Training Save Changes button clicked"
        );
    }

    async expectEditUpdateError(): Promise<void> {

        logger.info(
            "Verifying the known training update " +
            "server error is shown"
        );

        await expect(
            this.editUpdateErrorMessage.first()
        ).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });
    }

    async getTitleValidationMessage(): Promise<string> {

        return await this.editTitleInput.evaluate(
            el =>
                (
                    el as HTMLInputElement
                ).validationMessage
        );
    }

    // ---------------------------------------------------------------------
    // Delete
    // ---------------------------------------------------------------------

    async openDeleteConfirmation(
        target: TrainingProgramRowData
    ): Promise<void> {

        logger.info(
            `Opening delete confirmation for ` +
            `training program "${target.title}"`
        );

        /*
         * Locate the correct row first.
         */
        const row =
            await this.ensureProgramRowVisible(
                target
            );

        const deleteButton =
            row.locator(
                'button[title="Delete"]'
            ).first();

        await expect(deleteButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(deleteButton).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await deleteButton.click({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(
            this.deleteConfirmationHeading(
                target.title
            )
        ).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        logger.info(
            `Delete confirmation opened for ` +
            `"${target.title}"`
        );
    }

    async cancelDelete(): Promise<void> {

        logger.info(
            "Cancelling training program deletion"
        );

        const cancelButton =
            this.deleteConfirmationModal
                .getByRole("button", {
                    name: "Cancel",
                    exact: true
                });

        await expect(cancelButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await cancelButton.click({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(
            this.deleteConfirmationModal
        ).toBeHidden({
            timeout: this.ACTION_TIMEOUT
        });

        logger.info(
            "Training program deletion cancelled"
        );
    }

    async confirmDelete(): Promise<void> {

        logger.info(
            "Confirming training program deletion"
        );

        const confirmButton =
            this.deleteConfirmationModal
                .getByRole("button", {
                    name: "Delete",
                    exact: true
                });

        await expect(confirmButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(confirmButton).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await confirmButton.click({
            timeout: this.ACTION_TIMEOUT
        });

        logger.info(
            "Training program delete action confirmed"
        );
    }
}