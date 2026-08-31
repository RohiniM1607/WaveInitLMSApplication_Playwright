import { Locator, expect } from "playwright/test";
import { BasePage } from "../BasePage";
import { logger } from "../../../main/utils/logger";

export class CodingPage extends BasePage {
    private readonly courseItem = (course: string): Locator => this.page.locator("button.wl-sidebar-course-item").filter({hasText: course});
    private readonly codingModule: Locator = this.page.getByRole("tab", { name: "Coding", exact: true });
    private readonly createAssessmentButton =this.page.getByRole("button", {name: "Create Assessment"});
    private readonly generateWithAIButton =this.page.getByRole("button", {name: "Generate with AI"});
    //private readonly untitledCodingAssessment = this.page.getByText("Untitled Coding Assessment",{ exact: true });
    private readonly assessmentTable = this.page.locator("table.cct-table");
    private readonly assessmentRows = this.page.locator("table.cct-table tbody tr");
    private readonly cancelButton = this.page.getByRole("button", {name: "Cancel", exact: true});
    private readonly assessmentRow = (assessmentTitle: string): Locator => this.assessmentRows.filter({ hasText: assessmentTitle }).first();
    //private readonly editButton = this.page.getByRole("button", { name: "Edit", exact: true });
    private readonly deleteAssessmentButton = (assessmentTitle: string): Locator =>this.assessmentRow(assessmentTitle).locator('button[title="Delete"]');
    
    async selectCourse(course: string) { 
        const courseItem = this.courseItem(course);
        await courseItem.waitFor({ state: "visible", timeout: 10000});
        await this.click(courseItem);
        logger.info(`${course} selected`);
    }

    async navigateToCodingModule() {
        await this.click(this.codingModule);
        logger.info("Navigated to coding page");
    }


    async clickCreateAssessment() {
        await this.click(this.createAssessmentButton);
        logger.info("Clicked on create assessment button");
    }


    async clickGenerateWithAI() {
        await this.click(this.generateWithAIButton);
        logger.info("Clicked on generate with AI button");
    }

    async waitForAssessmentList() {
        await this.assessmentTable.waitFor({ state: "visible", timeout: 10000});
    }

    async getAssessmentCount() {
        await this.waitForAssessmentList();
        const count = await this.assessmentRows.count();
        return count;
    }

    async clickCancel() {
        await this.click(this.cancelButton);
        logger.info("Clicked Cancel button");
    }

    async clickEdit(assessmentTitle: string) {
        const row = this.assessmentRow(assessmentTitle);
        await row.waitFor({state: "visible", timeout: 10000});
        const editButton = row.locator('button[title="Edit Assessment"]');
        await editButton.waitFor({state: "visible",timeout: 10000});
        await this.click(editButton);
        logger.info(`Clicked Edit button for: ${assessmentTitle}`);
    }

    async clickDeleteAssessment(assessmentTitle: string) {
        const deleteButton = this.deleteAssessmentButton(assessmentTitle);
        await deleteButton.waitFor({state: "visible",timeout: 10000});
        await this.click(deleteButton);
        logger.info(`Clicked Delete button for: ${assessmentTitle}`);
    }

    async verifyAssessmentCount(previousCount: number,expectedCount: number) 
    {
        logger.info(`Previous assessment count: ${previousCount}`);
        logger.info(`Expected assessment count: ${expectedCount}`);
        await expect.poll(async () => await this.getAssessmentCount(),{timeout: 10000,message: `Assessment count did not update`}).toBe(expectedCount);
        const currentCount = await this.getAssessmentCount();
        logger.info(`Current assessment count: ${currentCount}`);
        logger.info(`Assessment count verified successfully. ` +`Expected: ${expectedCount}, Current: ${currentCount}`);
    }




}
