import { expect } from "playwright/test";
import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {   

    private dashboardHeader = this.page.locator('//h1[contains(text(), "Welcome back")]');

    async getDashboardHeaderText(timeout = 30000) {
    logger.info("Retrieving dashboard header text");
    await expect(this.dashboardHeader).toBeVisible({ timeout });
    return await this.getText(this.dashboardHeader);
}
}