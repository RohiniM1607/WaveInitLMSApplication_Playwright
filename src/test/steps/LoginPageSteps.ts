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
              
When('The user clicks on the login button', async function (this: CustomWorld) {
    await this.loginPage.clickLoginButton();
});
              
              
When('The user enters the {string} username and password', async function (this: CustomWorld, testcase : string) {
    const testData = loginData[`${testcase}Credentials` as keyof typeof loginData];
    await this.loginPage.fillUsername(testData.username);
    await this.loginPage.fillPassword(testData.password);
});
       
Then('The application should display the {string}', async function (this: CustomWorld, expectedMessage: string) {
    
    if(expectedMessage === "Validation message") { 
        const validity = await this.loginPage.verifyValidity();
        expect(validity.isNameValid).toBe(false);
        expect(validity.isDescriptionValid).toBe(false);
    }
    else{
        const actualMessage = await this.loginPage.getErrorMessage();
        expect(actualMessage).toBe(expectedMessage);    
    }
    
});


Then('The the dashboard header should be displayed with the text {string}', async function(this: CustomWorld, expectedText: string)  {
    const actualText = await this.dashboardPage.getDashboardHeaderText();
    expect(actualText?.startsWith(expectedText)).toBe(true);
})

When('The user clicks the {string} login button', async function (this: CustomWorld, role: string)  {
    selectedRole = role;
    await this.loginPage.clickLogin(role);
})
