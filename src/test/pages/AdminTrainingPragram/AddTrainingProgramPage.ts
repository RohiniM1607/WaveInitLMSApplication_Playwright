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

    private readonly ACTION_TIMEOUT = 60_000;
    private addTrainingButton = this.page.getByRole("button", {
        name: "Add Training"
    });

    private titleInput = this.page.getByRole("textbox", {
        name: "e.g. React Fundamentals"
    });

    private descriptionInput = this.page.getByRole("textbox", {
        name: "Training objectives and content overview..."
    });

    private trainerSearchInput = this.page.getByPlaceholder(
        "Search trainers by name or email..."
    );

    private dateTimeInputs = this.page.locator(
        'input[type="datetime-local"]'
    );

    private capacityInput = this.page.getByRole("spinbutton", {
        name: "e.g. 30"
    });

    private createButton = this.page.getByRole("button", {
        name: "Create Training Session"
    });

    private successToast = this.page.getByText(
        "Training created successfully",
        { exact: true }
    );

    private trainerRequiredError = this.page.getByText(
        "Trainer ID or Trainer IDs is required",
        { exact: true }
    );


    private trainerOption(
        trainerName: string,
        trainerEmail: string
    ): Locator {
        return this.page.getByRole("option", {
            name: `${trainerName} ${trainerEmail}`
        });
    }

    private toDateTimeLocalValue(date: Date): string {
        const pad = (n: number) =>
            n.toString().padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    async openAddTrainingForm(): Promise<void> {
        logger.info("Opening the Add Training form");

        await expect(this.addTrainingButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.addTrainingButton).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await this.addTrainingButton.click();

        await expect(this.titleInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.createButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        logger.info("Add Training form opened successfully");
    }
    // Title
    
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
    // Description
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

    async selectTrainer(
        trainerName: string,
        trainerEmail: string
    ): Promise<void> {
        logger.info(`Selecting trainer "${trainerName}"`);

        await expect(this.trainerSearchInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.trainerSearchInput).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await this.trainerSearchInput.fill("");

        await this.trainerSearchInput.pressSequentially(
            trainerName,
            {
                delay: 60
            }
        );

        const option = this.trainerOption(
            trainerName,
            trainerEmail
        );

        await expect(option).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await option.click();

        logger.info(
            `Trainer "${trainerName}" selected successfully`
        );
    }
    async setStartDate(date: Date): Promise<void> {
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

    async setEndDate(date: Date): Promise<void> {
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

    async fillCapacity(capacity: string): Promise<void> {
        await expect(this.capacityInput).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.capacityInput).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await this.capacityInput.fill(capacity);
    }

    async submit(): Promise<void> {
        logger.info("Submitting training session");

        await expect(this.createButton).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        await expect(this.createButton).toBeEnabled({
            timeout: this.ACTION_TIMEOUT
        });

        await this.createButton.click();

        logger.info("Create Training Session button clicked");
    }


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

    async isSuccessToastVisible(): Promise<boolean> {
        return await this.successToast
            .isVisible()
            .catch(() => false);
    }


    async isFormStillOpen(): Promise<boolean> {
        return await this.createButton
            .isVisible()
            .catch(() => false);
    }

    async isTrainerRequiredErrorVisible(): Promise<boolean> {
    try {
        await expect(this.trainerRequiredError).toBeVisible({
            timeout: this.ACTION_TIMEOUT
        });

        return true;
    } catch {
        return false;
    }
}

    async getTitleValidationMessage(): Promise<string> {
        return await this.titleInput.evaluate(
            (el) =>
                (el as HTMLInputElement).validationMessage
        );
    }

    async getStartDateValidationMessage(): Promise<string> {
        return await this.dateTimeInputs
            .nth(0)
            .evaluate(
                (el) =>
                    (el as HTMLInputElement).validationMessage
            );
    }

    async createTrainingSession(
        input: TrainingSessionFormInput
    ): Promise<void> {

        await this.openAddTrainingForm();

        if (input.title !== undefined) {
            await this.fillTitle(input.title);
        }

        if (input.description !== undefined) {
            await this.fillDescription(input.description);
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
            await this.setStartDate(input.startDate);
        }

        if (input.endDate !== undefined) {
            await this.setEndDate(input.endDate);
        }

        if (input.capacity !== undefined) {
            await this.fillCapacity(input.capacity);
        }
        await this.submit();
    }
}