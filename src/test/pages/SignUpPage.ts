import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class SignUpPage extends BasePage {

    private fullNameInputField = this.page.locator('#reg-name');
    private emailInputField = this.page.locator('#reg-email');
    private phoneInputField = this.page.locator('#reg-phone');
    private passwordInputField = this.page.locator('#reg-pw');
    private confirmPasswordInputField = this.page.locator('#reg-confirm');
    private signUpButton = this.page.locator('//button/span[text() = "Create Account"]');
    private termsOfServiceCheckBox = this.page.locator('//input[@class = "auth-checkbox"]');
    private signInLink = this.page.locator('//a[text() = "Sign in"]');
    private strengthIndicator = this.page.locator('//input[@type = "password"]/following::div[1]/div/span');

    async fillFullName(fullName: string) {
        logger.info(`Filling full name: ${fullName}`);
        await this.fill(this.fullNameInputField, fullName);
    }

    async fillEmail(email: string) {
        logger.info(`Filling email: ${email}`);
        await this.fill(this.emailInputField, email);
    }

    async fillPhone(phone: string) {
        logger.info(`Filling phone number: ${phone}`);
        await this.fill(this.phoneInputField, phone);
    }       

    async fillPassword(password: string) {
        logger.info(`Filling password: ${password}`);
        await this.fill(this.passwordInputField, password);
    }

    async fillConfirmPassword(confirmPassword: string) {   
        logger.info(`Filling confirm password: ${confirmPassword}`);
        await this.fill(this.confirmPasswordInputField, confirmPassword);
    }

    async checkTermsOfService() {
        logger.info("Checking terms of service checkbox.");
        await this.check(this.termsOfServiceCheckBox);
    }

    async clickSignUpButton() {
        logger.info("Clicking sign up button.");
        await this.click(this.signUpButton);
    }

    async clickSignInLink() {
        logger.info("Clicking sign in link.");
        await this.click(this.signInLink);
    }
    
    async fillRegisterFormDetails(fullName: string, email: string, phone: string, password: string, confirmPassword: string) {
        logger.info("Filling registration form details.");
        await this.fillFullName(fullName);
        await this.fillEmail(email);
        await this.fillPhone(phone);
        await this.fillPassword(password);
        await this.fillConfirmPassword(confirmPassword);
    }

    async getPasswordStrength() {
        logger.info("Retrieving password strength.");
        return await this.getText(this.strengthIndicator);
    }

    async verifyEmailValidity() {
            try {
                logger.info("Checking service form validation.");
    
                const isNameValid = await this.emailInputField.evaluate(
                    (el: HTMLInputElement) => el.validity.valid
                );
    
                logger.info(`Validation Result -> Name: ${isNameValid}`);
    
                return isNameValid;
            } catch (error) {
                logger.error(`Validation check failed: ${error}`);
                throw error;
            }
        }
}
