import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {   

    private usernameInput = this.page.locator('#login-email');
    private passwordInput = this.page.locator('#login-password');
    private loginButton = this.page.locator('//button[@class =  "auth-submit-btn"]');   
    private errorMessage = this.page.locator('//div[text()="Invalid email or password"]');
    private signUpLink = this.page.locator('//a[text() = "Sign up as Participant"]');

    async clickLogin(role: string) {
        logger.info(`Clicking on the ${role} login button`);
        const xpath = `//button[contains(@class , "auth-role-btn")]/span[text() = "${role}"]`;
        await this.click(this.page.locator(xpath));
    }

    async fillUsername(username: string) {
        logger.info(`Filling username: ${username}`);
        await this.fill(this.usernameInput, username);
    }

    async fillPassword(password: string) {
        logger.info(`Filling password: ${password}`);
        await this.fill(this.passwordInput, password);
    }

    async clickLoginButton() {
        logger.info("Clicking on the login button");
        await this.click(this.loginButton);
    }

    async login(username: string, password: string) {
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.clickLoginButton();
    }

    async getErrorMessage() {
        logger.info("Retrieving error message");
        return await this.getText(this.errorMessage);
    }
    
    async verifyValidity() {
        try {
            logger.info("Checking service form validation.");

            const isNameValid = await this.usernameInput.evaluate(
                (el: HTMLInputElement) => el.validity.valid
            );

            const isDescriptionValid = await this.passwordInput.evaluate(
                (el: HTMLTextAreaElement) => el.validity.valid
            );

            logger.info(`Validation Result -> Name: ${isNameValid}, Description: ${isDescriptionValid}`);

            return {
                isNameValid,
                isDescriptionValid
            };
        } catch (error) {
            logger.error(`Validation check failed: ${error}`);
            throw error;
        }
    }

    async clickSignUpLink() {
        logger.info("Clicking on the Sign Up link");
        await this.click(this.signUpLink);
    }
}   