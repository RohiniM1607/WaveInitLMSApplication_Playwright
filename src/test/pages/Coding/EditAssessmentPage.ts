import { expect } from "playwright/test";
import { BasePage } from "../BasePage";
import { logger } from "../../../main/utils/logger";

export class EditAssessmentPage extends BasePage{
    private editButton = this.page.getByRole("button", { name: "Edit", exact: true });
    private readonly assessmentTitleInput = this.page.locator("label").filter({ hasText: "Title" }).locator("..").locator("input");
    private readonly assessmentDescriptionInput = this.page.locator("label").filter({ hasText: "Description" }).locator("..").locator("textarea");
    private readonly assessmentDurationInput = this.page.locator("label").filter({ hasText: "Time Limit (minutes)" }).locator("..").locator("input");
    private readonly saveButton = this.page.getByRole("button", {name: "Save Changes",exact: true});    
    private readonly cancelButton = this.page.getByRole("button", {name: "Cancel",exact: true});
    private readonly updatedTitle = this.page.locator("h1").nth(1);
    private readonly updatedDescription = (description: string) =>this.page.getByText(description, { exact: true });
    private readonly updatedDuration = (duration: string) => this.page.getByText(`${duration} minutes`, { exact: true });
    private readonly titleValidationMessage = this.page.getByText("Assessment title is required",{ exact: true });

    async clickEditButton() {
        await this.click(this.editButton);
        logger.info("Clicking edit button")
    }

    async updateAssessmentTitle(updatedTitle: string) {
        logger.info(`Updating assessment title to: ${updatedTitle}`);
        await this.fill(this.assessmentTitleInput, updatedTitle);
    }

    async updateAssessmentDetails(updatedTitle: string, updatedDescription: string,updatedDuration: string)
    {
        logger.info("Updating multiple assessment details");
        await this.fill(this.assessmentTitleInput, updatedTitle);
        await this.fill(this.assessmentDescriptionInput, updatedDescription);
        await this.fill(this.assessmentDurationInput, updatedDuration);
    }

    async clickSaveButton() {
        logger.info("Clicking Save button");
        await this.click(this.saveButton);
    }

    async verifyUpdatedTitle(updatedTitle: string) {
        logger.info(`Verifying updated title: ${updatedTitle}`);
        await expect(this.updatedTitle).toHaveText(updatedTitle);
    }

    async verifyUpdatedDetails(title: string,description: string,duration: string) 
    {
        logger.info("Verifying updated assessment details");
        await expect(this.updatedTitle).toHaveText(title);
        await expect(this.updatedDescription(description)).toBeVisible();
        await expect(this.updatedDuration(duration)).toBeVisible();
    }

    async verifyAssessmentUnchanged(existingTitle: string) {
        logger.info(`Verifying assessment is unchanged: ${existingTitle}`);

        await expect(this.updatedTitle).toHaveText(existingTitle);
    }

    async clearAssessmentTitle() {
        logger.info("Clearing assessment title");
        await this.fill(this.assessmentTitleInput,"");
    }

    async verifyTitleValidationMessage() {
        logger.info("Verifying title validation message");
        await expect(this.titleValidationMessage).toBeVisible();
    }

    async clickCancelButton() {
        logger.info("Clicking Cancel button");
        await this.click(this.cancelButton);
    }

    async verifyOriginalTitle(existingTitle: string) {
        logger.info(`Verifying original assessment title: ${existingTitle}`);
        await expect(this.updatedTitle).toHaveText(existingTitle);
    }

}