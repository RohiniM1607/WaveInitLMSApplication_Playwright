import { Locator } from "playwright";
import { BasePage } from "../BasePage";
import { logger } from "../../../main/utils/logger";

export class AssessmentPage extends BasePage {

    private readonly topicOrPrompt = this.page.getByPlaceholder("e.g. JavaScript array methods, Python data structures, etc.");
    private readonly numberOfProblems: Locator = this.page.locator("label").filter({ hasText: "Number of Problems" }).locator("..").locator("select");
    private readonly difficulty: Locator = this.page.locator("label").filter({ hasText: "Difficulty" }).locator("..").locator("select");
    private readonly languages: Locator = this.page.locator("label").filter({ hasText: "Languages (comma-separated)" }).locator("..").locator("input");
    private readonly generateAssessmentButton = this.page.getByRole("button",{ name: "Generate Assessment", exact: true });

    async enterAssessmentDetails(): Promise<void> {
        await this.topicOrPrompt.waitFor({state: "visible", timeout: 10000});
        await this.fill(this.topicOrPrompt, "JavaScript arrays and objects");
        logger.info("Assessment details entered");
    }

    async clickGenerateAssessment(): Promise<void> {
        await this.click(this.generateAssessmentButton);
        logger.info("Clicked Generate Assessment button");
    }
}