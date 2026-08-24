import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {   

    private dashboardHeader = this.page.locator('//h1[contains(text(), "Welcome back")]');

    async getDashboardHeaderText() {
        logger.info("Retrieving dashboard header text");
        return await this.getText(this.dashboardHeader);
    }
}