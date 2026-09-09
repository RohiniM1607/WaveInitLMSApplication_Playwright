import fi from "zod/v4/locales/fi.js";
import { PersonalInfo } from "../../main/types/PersonalInfo";
import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage"

export class MyProfilePage extends BasePage {

    private newPage: any;
    private saveLinksButton = this.page.locator('//button[@class = "pfd-btn-primary"]');
    private editSocialLinksButton = this.page.locator('//div[text() = "Social Links"]/following::button[1]');
    private profileUploadButton = this.page.locator('//button[contains(text() , "Edit Profile")]/following::div[1]/div/div/button');
    private saveProfileButton = this.page.locator('//button[text() = "Save Photo"]');
    private chooseImage = this.page.locator('//label[contains(text() , "Choose Image")]');
    private profileImage = this.page.locator('//button[contains(text() , "Edit Profile")]/following::div[1]/div/div/div/img');
    private removeProfileButton = this.page.locator('//button[contains(text() , "Remove Photo")]');
    private usernameInitials = this.page.locator('//button[contains(text() , "Edit Profile")]/following::div[1]/div/div/div[contains(@style, "width: 72px")]');
    private username = this.page.locator('//h3').first();
    private editPersonalInfoButton = this.page.locator('//div[text() = "Personal Information"]/following::button[1]');
    private fullNameInputField = this.page.locator('//input').nth(0);
    private emailInputField = this.page.locator('//input').nth(1);
    private participationIdInputField = this.page.locator('//input').nth(2);
    private phoneNumberInputField = this.page.locator('//input').nth(3);
    private departmentInputField = this.page.locator('//input').nth(4);
    private designationInputField = this.page.locator('//input').nth(5);
    private aboutMeInputField = this.page.locator('//textarea');
    private savePersonalInfoButton = this.page.locator('//button[text() = "Save Changes"]');
    private cancelPersonalInfoButton = this.page.locator('//button[text() = "Cancel"]');
    private fullNameRequiredError = this.page.locator('//input[@placeholder = "Full Name"]/following-sibling::div[contains(text(), "Full name is required.")]');


    async isProfileImageVisible(): Promise<boolean> {
        logger.info("Checking visibility of profile image");
        return await this.isVisible(this.profileImage);
    }

    async fillSocialLink(socialMedia: string, socialLink: string) {
        logger.info(`Filling social link for ${socialMedia}: ${socialLink}`);
        const locator = this.page.locator(`//input[contains(@placeholder, "${socialMedia.toLocaleLowerCase()}")]`);
        await this.fill(locator, socialLink);
    }

    async clickSocialLink(socialMedia: string) {
        logger.info(`Clicking on ${socialMedia} social link`);
        
        [this.newPage] = await Promise.all([
            this.page.context().waitForEvent('page'),
            this.page.locator(`//a[contains(@href, "${socialMedia.toLocaleLowerCase()}")]`).click()
        ]);
        await this.newPage.waitForLoadState();
    }

    async clickSaveLinksButton() {
        logger.info("Clicking on Save Links button in the sidebar");
        await this.click(this.saveLinksButton);
    }

    async clickEditSocialLinksButton() {
        logger.info("Clicking on Edit Social Links button in the sidebar");
        await this.click(this.editSocialLinksButton);
    }

    async isSocialLinkVisible(socialMedia: string): Promise<boolean> {
        logger.info(`Checking visibility of ${socialMedia} social link`);
        const locator = this.page.locator(`//a[contains(@href, "${socialMedia}")]`);
        logger.info(`Locator for ${socialMedia} social link: ${locator}`);
        return await this.isVisible(locator);
    }

    async getCurrentPageUrl() {
        logger.info("Getting current page URL");
        return this.newPage.url();
    }

    async clickProfileUploadButton() {
        logger.info("Clicking on Profile Upload button");
        await this.click(this.profileUploadButton);
    }

    async clickChooseImageButton() {
        logger.info("Clicking on Choose Image button");
        await this.click(this.chooseImage);
    }

    async clickSaveProfileButton() {
        logger.info("Clicking on Save Profile button");
        await this.click(this.saveProfileButton);
    }

    async clickRemoveProfileButton() {
        logger.info("Clicking on Remove Profile button");
        await this.click(this.removeProfileButton);
    }

    async getUsernameInitials(): Promise<string> {
        logger.info("Getting username initials");
        await this.page.waitForTimeout(5000); 
        const usernameInitials = await this.usernameInitials.textContent();
        logger.info(`Username initials: ${usernameInitials}`);
        return usernameInitials || '';
    }

    async getUsername(): Promise<string> {
        logger.info("Getting username");
        const username = await this.username.textContent();
        logger.info(`Username: ${username}`);
        return username || '';
    }

    async clickEditPersonalInfoButton() {
        logger.info("Clicking on Edit Personal Info button");
        await this.click(this.editPersonalInfoButton);
    }

    async fillFullNameInputField(value: string) {
        logger.info(`Filling Full Name input field with value: ${value}`);
        await this.fill(this.fullNameInputField, value);
    }

    async fillEmailInputField(value: string) {
        logger.info(`Filling Email input field with value: ${value}`);
        await this.fill(this.emailInputField, value);
    }

    async fillParticipationIdInputField(value: string) {
        logger.info(`Filling Participation ID input field with value: ${value}`);
        await this.fill(this.participationIdInputField, value);
    }

    async fillPhoneNumberInputField(value: string) {
        logger.info(`Filling Phone Number input field with value: ${value}`);
        await this.fill(this.phoneNumberInputField, value);
    }

    async fillDepartmentInputField(value: string) {
        logger.info(`Filling Department input field with value: ${value}`);
        await this.fill(this.departmentInputField, value);
    }

    async fillDesignationInputField(value: string) {
        logger.info(`Filling Designation input field with value: ${value}`);
        await this.fill(this.designationInputField, value);
    }

    async fillAboutMeInputField(value: string) {
        logger.info(`Filling About Me input field with value: ${value}`);
        await this.fill(this.aboutMeInputField, value);
    }

    async clickSavePersonalInfoButton() {
        logger.info("Clicking on Save Personal Info button");
        await this.click(this.savePersonalInfoButton);
    }

    async clickCancelPersonalInfoButton() {
        logger.info("Clicking on Cancel Personal Info button");
        await this.click(this.cancelPersonalInfoButton);
    }

    async getPersonalInfoFieldValue(fieldName: string): Promise<string> {
        logger.info(`Getting value of personal info field ${fieldName}`);
        const locator = `//span[contains(text(),"${fieldName}")]/following-sibling::span`;
        let value = ''
        if(fieldName == "Department" || fieldName == "Designation")  {
            value = await this.page.locator(locator).nth(2).textContent() || '';
        }
        else if(fieldName == "Email")  {
            value = await this.page.locator(locator).nth(1).nth(0).textContent() || '';
            value = value.split(' ')[0];
        }
        else  {
            value = await this.page.locator(locator).textContent() || '';
        }
        logger.info(`Value of personal info field ${fieldName}: ${value}`);
        return value;
    }

    async getFullNameRequiredErrorMessage(): Promise<string> { 
        this.page.waitForTimeout(5000);
        logger.info("Getting Full Name required error message");
        const errorMessage = await this.fullNameRequiredError.textContent() || '';
        return errorMessage;
    }

    async isFieldReadOnly(fieldName: string): Promise<boolean> {
        logger.info(`Checking if field ${fieldName} is read-only`);
        if(fieldName === "Email") {
            const isReadOnly = await this.emailInputField.getAttribute('readonly') !== null;
            return isReadOnly;
        }
        else if(fieldName === "Participation ID") {
            const isReadOnly = await this.participationIdInputField.getAttribute('readonly') !== null;
            return isReadOnly;
        }
        return false;
    }

    async getCurrentPersonalDetails(): Promise<PersonalInfo> {
        logger.info("Getting current personal details");
        const personalDetails: PersonalInfo = {
            fullName: '',
            email: '',
            participationId: '',
            phoneNumber: '',
            department: '',
            designation: '',
            aboutMe: ''
        };
        
        personalDetails.fullName = await this.getPersonalInfoFieldValue("Full Name");
        personalDetails.email = await this.getPersonalInfoFieldValue("Email");
        personalDetails.participationId = await this.getPersonalInfoFieldValue("Participation ID");
        personalDetails.phoneNumber = await this.getPersonalInfoFieldValue("Phone Number");
        personalDetails.department = await this.getPersonalInfoFieldValue("Department");
        personalDetails.designation = await this.getPersonalInfoFieldValue("Designation");
        personalDetails.aboutMe = await this.getPersonalInfoFieldValue("About Me");

        return personalDetails as PersonalInfo;
    }
}