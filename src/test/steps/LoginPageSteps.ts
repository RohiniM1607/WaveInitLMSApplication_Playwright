import {Given, When, Then} from "@cucumber/cucumber";
import { CustomWorld } from "../../main/support/CustomWorld";
import { expect } from "playwright/test";
import loginData from "../../resources/data/loginDataset.json";

let selectedRole: string;

Given('The user launches the application', async function (this: CustomWorld) {
    await this.loginPage.navigate();
});
       
When('The user enters valid username and password', async function (this: CustomWorld) {
    const testData = loginData[`valid${selectedRole}` as keyof typeof loginData];
    await this.loginPage.fillUsername(testData.username);
    await this.loginPage.fillPassword(testData.password);
});
              
When('The user clicks the login button', async function (this: CustomWorld) {
    await this.loginPage.clickLoginButton();
});
       
Then('The dashboard header should be displayed with the text {string}', async function(this: CustomWorld, expectedText: string)  {
    const actualText = await this.dashboardPage.getDashboardHeaderText();
    expect(actualText?.startsWith(expectedText)).toBe(true);
})

When('The user clicks the {string} login button', async function (this: CustomWorld, role: string)  {
    selectedRole = role;
    await this.loginPage.clickLogin(role);
})

When('The user leaves the username and password fields empty', async function (this: CustomWorld)  {
    await this.loginPage.fillUsername("");
    await this.loginPage.fillPassword("");
})

Then('The username and password fields should display validation errors', async function (this: CustomWorld)  {
    const validity = await this.loginPage.verifyValidity();
    expect(validity.isNameValid).toBe(false);
    expect(validity.isDescriptionValid).toBe(false);
})

Then('The application should display the error message {string}', async function (this: CustomWorld, expectedMessage: string)  {
    const actualMessage = await this.loginPage.getErrorMessage();
    expect(actualMessage).toBe(expectedMessage);
})

When('The user enters invalid username and password', async function (this: CustomWorld)  {
    const testData = loginData[`invalidCredentials` as keyof typeof loginData];
    await this.loginPage.fillUsername(testData.username);
    await this.loginPage.fillPassword(testData.password);
})
