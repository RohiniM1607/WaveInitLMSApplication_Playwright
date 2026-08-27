import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class SidebarPage extends BasePage {
    private myProfileLink = this.page.locator('//span[contains(text() , "My Profile")]');

    async clickMyProfileLink() {
        logger.info("Clicking on My Profile link in the sidebar");
        await this.click(this.myProfileLink);
    }
}