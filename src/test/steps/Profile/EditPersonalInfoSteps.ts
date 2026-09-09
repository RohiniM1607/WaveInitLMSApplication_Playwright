import {Given, When, Then} from '@cucumber/cucumber';
import { CustomWorld } from '../../../main/support/CustomWorld';
import { expect } from '@playwright/test';
import { PersonalInfo } from '../../../main/types/PersonalInfo';
import { time } from 'node:console';

let personalDetails: PersonalInfo = {
    fullName: '',
    email: '',
    participationId: '',
    phoneNumber: '',
    department: '',
    designation: '',
    aboutMe: ''
};

When('the user updates the form with valid details', async function (this: CustomWorld, dataTable) {
    personalDetails = await this.myProfilePage.getCurrentPersonalDetails();
    const data = dataTable.rowsHash();
    await this.myProfilePage.fillFullNameInputField(data['Full Name']);
    await this.myProfilePage.fillPhoneNumberInputField(data['Phone Number']);
    await this.myProfilePage.fillDepartmentInputField(data['Department']);
    await this.myProfilePage.fillDesignationInputField(data['Designation']);
    await this.myProfilePage.fillAboutMeInputField(data['About Me']);
});

When('the user clicks on the Save Changes button', async function (this: CustomWorld) {
    await this.myProfilePage.clickSavePersonalInfoButton();
});

Then('the updated information should be displayed on the profile page', async function (this: CustomWorld, dataTable) {
    const expectedData = dataTable.rowsHash();
    for (const [fieldName, expectedValue] of Object.entries(expectedData)) {
        const actualValue = await this.myProfilePage.getPersonalInfoFieldValue(fieldName);
        expect(actualValue).toBe(expectedValue);
    }
});

Given('The user clicks on the Edit button in the personal information section', async function (this: CustomWorld) {
    await this.myProfilePage.clickEditPersonalInfoButton();
});

When('the user updates the Full Name with {string}', async function (this: CustomWorld, string) {
    await this.myProfilePage.fillFullNameInputField(string);
});

Then('the Full Name should be updated successfully as {string}', async function (this: CustomWorld, string) {
    const actualValue = await this.myProfilePage.getPersonalInfoFieldValue("Full Name");
    this.page.waitForTimeout(5000);
    expect(actualValue).toBe(string);
});

Then('the {string} field should be read-only', async function (this: CustomWorld, string) {
    const isReadOnly = await this.myProfilePage.isFieldReadOnly(string);
    expect(isReadOnly).toBe(true);
});

Then('the user should not be able to modify the {string}', async function (this: CustomWorld, string) {
    const isReadOnly = await this.myProfilePage.isFieldReadOnly(string);
    expect(isReadOnly).toBe(true);
});

When('the user clears the Full Name field', async function (this: CustomWorld) {
    await this.myProfilePage.fillFullNameInputField("");
});

Then('a validation message should be displayed for the Full Name field', async function (this: CustomWorld) {
    const errorMessage = await this.myProfilePage.getFullNameRequiredErrorMessage();
    expect(errorMessage).toBe("Full Name is required");
});

When('the user enters only whitespace in the Full Name field', async function (this: CustomWorld) {
    await this.myProfilePage.fillFullNameInputField("   ");
});


When('the user clicks on the Cancel button', async function (this: CustomWorld) {
    await this.myProfilePage.clickCancelPersonalInfoButton();
});


Then('the changes should not be saved in the personal information section', async function (this: CustomWorld) {
    const updatedPersonalDetails = await this.myProfilePage.getCurrentPersonalDetails();
    expect(updatedPersonalDetails).toEqual(personalDetails);
});

When('the user enters {string} in the Phone Number field', async function (this: CustomWorld, string) {
    await this.myProfilePage.fillPhoneNumberInputField(string);
});

Then('an appropriate validation message should be displayed', async function (this: CustomWorld) {
    // Implement validation message check logic here
});


Then('the existing form details should be displayed in the fields', async function (this: CustomWorld, dataTable) {
    const expectedData = dataTable.rowsHash();
    for (const [fieldName, expectedValue] of Object.entries(expectedData)) {
        const actualValue = await this.myProfilePage.getPersonalInfoFieldValue(fieldName);
        expect(actualValue).toBe(expectedValue);
    }
});