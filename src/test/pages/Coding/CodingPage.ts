import { Expect, Locator } from "playwright/test";
import { BasePage } from "../BasePage";
import { logger } from "../../../main/utils/logger";

export class CodingPage extends BasePage {
    private readonly courseItem = (course: string): Locator => this.page.locator("button.wl-sidebar-course-item").filter({hasText: course});
    private readonly codingModule: Locator = this.page.getByRole("tab", { name: "Coding", exact: true });
    private readonly createAssessmentButton =this.page.getByRole("button", {name: "Create Assessment"});
    private readonly generateWithAIButton =this.page.getByRole("button", {name: "Generate with AI"});
    private readonly untitledCodingAssessment = this.page.getByText("Untitled Coding Assessment",{ exact: true });
    private readonly assessmentTable = this.page.locator("table.cct-table");
    private readonly assessmentRows = this.page.locator("table.cct-table tbody tr");
    private readonly cancelButton = this.page.getByRole("button", {name: "Cancel", exact: true});

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

    async verifyAssessmentAdded(previousCount: number) {
        await this.untitledCodingAssessment.nth(previousCount).waitFor({ state: "visible", timeout: 1000000});
        const currentCount = await this.getAssessmentCount();
        logger.info(`Previous assessment count: ${previousCount}`);
        logger.info(`Current assessment count: ${currentCount}`);
        if (currentCount !== previousCount + 1) {
            throw new Error( `Assessment was not added. ` + `Previous: ${previousCount}, ` + `Current: ${currentCount}`);
        }
        logger.info(`Assessment added successfully. ` + `Previous: ${previousCount}, Current: ${currentCount}`);
    }

    async clickCancel() {
        await this.click(this.cancelButton);
        logger.info("Clicked Cancel button");
    }

    async verifyAssessmentNotAdded(previousCount: number){
        const currentCount = await this.getAssessmentCount();
        logger.info(`Previous assessment count: ${previousCount}`);
        logger.info(`Current assessment count: ${currentCount}`);
        if (currentCount !== previousCount) {
            throw new Error(`Assessment was added unexpectedly. ` +`Previous: ${previousCount}, ` +`Current: ${currentCount}`);
        }
        logger.info(`Verified that assessment was not added. ` +`Previous: ${previousCount}, Current: ${currentCount}`);
    }
}