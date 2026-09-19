import { expect, Locator } from "@playwright/test";
import { logger } from "../../../main/utils/logger";
import { BasePage } from "../BasePage";

export interface TrainingSessionFormInput {
    title?: string;
    description?: string;
    trainerName?: string;
    trainerEmail?: string;
    capacity?: string;
    startDate?: Date;
    endDate?: Date;
}

export class AddTrainingProgramPage extends BasePage {

    /*
     * Keep Playwright action timeout lower than the
     * Cucumber step timeout.
     *
     * Cucumber step timeout = 65 seconds
     * Playwright action timeout = 30 seconds
     */
    private readonly ACTION_TIMEOUT = 30_000;

    // Add Training button
    private addTrainingButton = this.page.getByRole("button", {
        name: "Add Training",
        exact: true
    });

    // Training title
    private titleInput = this.page.getByRole("textbox", {
        name: "e.g. React Fundamentals",
        exact: true
    });

    // Training description
    private descriptionInput = this.page.getByRole("textbox", {
        name: "Training objectives and content overview...",
        exact: true
    });

    // Trainer search
    private trainerSearchInput = this.page.getByPlaceholder(
        "Search trainers by name or email..."
    );

    // Start date and end date
    private dateTimeInputs = this.page.locator(
        'input[type="datetime-local"]'
    );

    // Capacity
    private capacityInput = this.page.getByRole("spinbutton", {
        name: "e.g. 30",
        exact: true
    });

    // Create button
    private createButton = this.page.getByRole("button", {
        name: "Create Training Session",
        exact: true
    });

    // Success message
    private successToast = this.page.getByText(
        "Training created successfully",
        {
            exact: true
        }
    );

    // Trainer required error
    private trainerRequiredError = this.page.getByText(
        "Trainer ID or Trainer IDs is required",
        {
            exact: true
        }
    );


    /*
     * Trainer option
     */
    private trainerOption(
        trainerName: string,
        trainerEmail: string
    ): Locator {
        return this.page.getByRole("option", {
            name: `${trainerName} ${trainerEmail}`,
            exact: true
        });
    }


    /*
     * Convert JavaScript Date into the format required
     * by input[type="datetime-local"].
     *
     * Example:
     * 2026-09-20T10:00
     */
    private toDateTimeLocalValue(date: Date): string {

        const pad = (value: number): string =>
            value.toString().padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }


    /*
     * Open Add Training form
     */
    async openAddTrainingForm(): Promise<void> {

        logger.info("Opening the Add Training form");

        // Handle cookie popup before interacting with the page
        await this.dismissCookieConsentIfPresent();

        // Wait for Add Training button
        await expect(this.addTrainingButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.addTrainingButton).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        // Click Add Training
        await this.addTrainingButton.click();

        // Verify form opened
        await expect(this.titleInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.createButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        logger.info("Add Training form opened successfully");
    }


    /*
     * Fill title
     */
    async fillTitle(title: string): Promise<void> {

        logger.info(`Filling training title: "${title}"`);

        await expect(this.titleInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.titleInput).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await this.titleInput.fill(title);
    }


    /*
     * Fill description
     */
    async fillDescription(description: string): Promise<void> {

        logger.info("Filling training description");

        await expect(this.descriptionInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.descriptionInput).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await this.descriptionInput.fill(description);
    }


    /*
     * Select trainer
     */
    async selectTrainer(
        trainerName: string,
        trainerEmail: string
    ): Promise<void> {

        logger.info(
            `Selecting trainer "${trainerName}" (${trainerEmail})`
        );

        // Trainer search field
        await expect(this.trainerSearchInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.trainerSearchInput).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        // Clear previous search
        await this.trainerSearchInput.fill("");

        /*
         * Use fill instead of pressSequentially.
         *
         * This is faster and avoids unnecessary delays.
         */
        await this.trainerSearchInput.fill(trainerName);

        // Locate trainer option
        const option = this.trainerOption(
            trainerName,
            trainerEmail
        );

        // Wait for trainer result
        await expect(option).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(option).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        // Select trainer
        await option.click();

        logger.info(
            `Trainer "${trainerName}" selected successfully`
        );
    }


    /*
     * Set start date
     */
    async setStartDate(date: Date): Promise<void> {

        logger.info(
            `Setting start date: ${this.toDateTimeLocalValue(date)}`
        );

        const startDateInput = this.dateTimeInputs.nth(0);

        await expect(startDateInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(startDateInput).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await startDateInput.fill(
            this.toDateTimeLocalValue(date)
        );
    }


    /*
     * Set end date
     */
    async setEndDate(date: Date): Promise<void> {

        logger.info(
            `Setting end date: ${this.toDateTimeLocalValue(date)}`
        );

        const endDateInput = this.dateTimeInputs.nth(1);

        await expect(endDateInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(endDateInput).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await endDateInput.fill(
            this.toDateTimeLocalValue(date)
        );
    }


    /*
     * Fill capacity
     */
    async fillCapacity(capacity: string): Promise<void> {

        logger.info(`Filling training capacity: ${capacity}`);

        await expect(this.capacityInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.capacityInput).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await this.capacityInput.fill(capacity);
    }


    /*
     * Submit training form
     */
    async submit(): Promise<void> {

        logger.info("Submitting training session");

        await expect(this.createButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.createButton).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await this.dismissCookieConsentIfPresent();

        await this.createButton.click();

        logger.info(
            "Create Training Session button clicked"
        );
    }


    /*
     * Wait for successful creation
     */
    async waitForSuccessToast(): Promise<void> {

        logger.info(
            "Waiting for training creation success confirmation"
        );

        await expect(this.successToast).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        logger.info(
            "Training created successfully confirmation displayed"
        );
    }


    /*
     * Check success toast without throwing an error
     */
    async isSuccessToastVisible(): Promise<boolean> {

        return await this.successToast
            .isVisible({
                timeout: 3000
            })
            .catch(() => false);
    }


    /*
     * Check whether Add Training form is still open
     */
    async isFormStillOpen(): Promise<boolean> {

        return await this.createButton
            .isVisible({
                timeout: 3000
            })
            .catch(() => false);
    }


    /*
     * Check trainer required error
     */
    async isTrainerRequiredErrorVisible(): Promise<boolean> {

        try {

            await expect(this.trainerRequiredError).toBeVisible({
                timeout: 5000
            });

            return true;

        } catch {

            return false;
        }
    }


    /*
     * Get browser native validation message
     * for title field
     */
    async getTitleValidationMessage(): Promise<string> {

        return await this.titleInput.evaluate(
            (element) =>
                (element as HTMLInputElement).validationMessage
        );
    }


    /*
     * Get browser native validation message
     * for start date field
     */
    async getStartDateValidationMessage(): Promise<string> {

        return await this.dateTimeInputs
            .nth(0)
            .evaluate(
                (element) =>
                    (element as HTMLInputElement).validationMessage
            );
    }


    /*
     * Reusable method for creating a training session
     */
    async createTrainingSession(
        input: TrainingSessionFormInput
    ): Promise<void> {

        await this.openAddTrainingForm();

        /*
         * Fill only the fields provided by the test case.
         *
         * This is important for negative scenarios where
         * a field intentionally needs to remain empty.
         */

        if (input.title !== undefined) {

            await this.fillTitle(
                input.title
            );
        }


        if (input.description !== undefined) {

            await this.fillDescription(
                input.description
            );
        }


        if (
            input.trainerName !== undefined &&
            input.trainerEmail !== undefined
        ) {

            await this.selectTrainer(
                input.trainerName,
                input.trainerEmail
            );
        }


        if (input.startDate !== undefined) {

            await this.setStartDate(
                input.startDate
            );
        }


        if (input.endDate !== undefined) {

            await this.setEndDate(
                input.endDate
            );
        }


        if (input.capacity !== undefined) {

            await this.fillCapacity(
                input.capacity
            );
        }


        // Submit after all provided fields are filled
        await this.submit();
    }
}