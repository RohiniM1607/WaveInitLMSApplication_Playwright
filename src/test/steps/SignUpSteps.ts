import {Given, When, Then} from '@cucumber/cucumber'
import { CustomWorld } from '../../main/support/CustomWorld';
import { expect } from 'playwright/test';
import { time } from 'node:console';

let emptyField: string;

Given('The user navigates to the registration page', async function (this: CustomWorld) {
    await this.loginPage.clickSignUpLink();
});

When('The user enters valid details in the registration form', async function (this: CustomWorld, dataTable) {
    const data = dataTable.rowsHash();
    const email = data.EmailAddress+`${Date.now()}@example.com`;
    await this.signUpPage.fillRegisterFormDetails(
        data.FullName,
        email,
        data.PhoneNumber,
        data.Password,
        data.ConfirmPassword
    );
});

When('The user accepts the Terms of Service', async function (this: CustomWorld) {
    await this.signUpPage.checkTermsOfService();
});

When('The user clicks the Create Account button', async function (this: CustomWorld) {
    await this.signUpPage.clickSignUpButton();
});

Then('The user should be redirected to the login page', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/.*login/, { timeout: 10000 });
});

When('The user leaves the {string} field empty', async function (this: CustomWorld, string) {
    emptyField = string;
});

When('The user fills the remaining registration fields with valid details', async function (this: CustomWorld, dataTable) {
    const data = dataTable.rowsHash();
    const email = data.EmailAddress+`${Date.now()}@example.com`;
    await this.signUpPage.fillRegisterFormDetails(
        data.FullName,
        email,
        data.PhoneNumber,
        data.Password,
        data.ConfirmPassword
    );
    if (emptyField === 'FullName') {
        await this.signUpPage.fillFullName('');
    }
    if (emptyField === 'EmailAddress') {
        await this.signUpPage.fillEmail('');
    }
    if (emptyField === 'PhoneNumber') {
        await this.signUpPage.fillPhone('');
    }
    if (emptyField === 'Password') {
        await this.signUpPage.fillPassword('');
    }
});

Then('The registration error message should be displayed as {string}', async function (this: CustomWorld, string) {
    
});

When('The user enters valid registration details except password', async function (this: CustomWorld, dataTable) {
    const data = dataTable.rowsHash();
    const email = data.EmailAddress+`${Date.now()}@example.com`;
    await this.signUpPage.fillRegisterFormDetails(
        data.FullName,
        email,
        data.PhoneNumber,
        '',
        ''  
    );
});

When('The user enters {string} in the password field', async function (this: CustomWorld, string) {
    await this.signUpPage.fillPassword(string);
});

When('The user enters {string} in the confirm password field', async function (this: CustomWorld, string) {
    await this.signUpPage.fillConfirmPassword(string);
});

When('The user enters {string} in the email field', async function (this: CustomWorld, string) {
    await this.signUpPage.fillEmail(string);
});

When('The user enters valid values in all other registration fields', async function (this: CustomWorld) {
    
});

Then('The email field should display a validation message', async function (this: CustomWorld) {
    const isEmailValid = await this.signUpPage.verifyEmailValidity();
    expect(isEmailValid).toBe(false);
});

Then('The password strength should be displayed as {string}', async function (this: CustomWorld, string) {
    const actualStrength = await this.signUpPage.getPasswordStrength();
    expect(actualStrength).toBe(string);
});

When('The user clicks the Sign in link', async function (this: CustomWorld) {
    await this.signUpPage.clickSignInLink();
});

Then('The login page should be displayed', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/.*login/);
});