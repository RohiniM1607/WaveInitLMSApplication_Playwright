import { Expect, Locator } from "playwright/test";
import { BasePage } from "../BasePage";
import { logger } from "../../../main/utils/logger";

export class CodingPage extends BasePage {
    private readonly courseItem = (course: string): Locator =>
    this.page.locator("button.wl-sidebar-course-item").filter({hasText: course});
    private readonly codingModule: Locator =
    this.page.getByRole("tab", { name: "Coding", exact: true });
    private readonly createAssessmentButton =this.page.getByRole("button", {name: "Create Assessment"});
    private readonly generateWithAIButton =this.page.getByRole("button", {name: "Generate with AI"});
    private readonly untitledCodingAssessment = this.page.getByText("Untitled Coding Assessment",{ exact: true });

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


    async clickCreateAssessment(){
        await this.click(this.createAssessmentButton);
        logger.info("Clicked on create assessment button");
    }


    async clickGenerateWithAI(){
        await this.click(this.generateWithAIButton);
        logger.info("Clicked on generate with AI button");
    }

    async verifyAssessmentAdded(){
        await this.untitledCodingAssessment.first().waitFor({state: "visible",timeout: 10000});
        const count = await this.untitledCodingAssessment.count();
        if (count < 1) {
            throw new Error("Untitled Coding Assessment was not added.");
        }
        logger.info("Untitled Coding Assessment was added successfully.");
    }
}