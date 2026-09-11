import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../../main/support/CustomWorld';
import { expect } from '@playwright/test';

Given('the user does not have a resume uploaded', async function (this: CustomWorld) {

});

Then('the Upload Resume button should be displayed', async function (this: CustomWorld) {
    await expect(this.myProfilePage.isUpdateResumeButtonVisible()).toBe(true);
});

Then('the uploaded resume file should not be displayed', async function (this: CustomWorld) {
    await expect((await this.myProfilePage.getResumeFileName().length())).toBe(0);
});

Then('the Delete button should not be displayed', async function (this: CustomWorld) {
    await expect(this.myProfilePage.isDeleteButtonVisible()).toBe(false);
});

Then('the Download button should not be displayed', async function (this: CustomWorld) {
    await expect(this.myProfilePage.isDownloadButtonVisible()).toBe(false);
});

When('the user clicks the Upload Resume button', async function (this: CustomWorld) {

});

When('the user selects a valid {string} resume file smaller than or equal to {int} MB', async function (this: CustomWorld, fileType: string, fileSize: number) {

});

Then('the selected file should display a {string} message', async function (this: CustomWorld, message: string) {

});

Then('the resume should be uploaded successfully', async function (this: CustomWorld) {

});

Then('the uploaded resume file should be displayed in the profile', async function (this: CustomWorld) {

});

When('the user selects a {string} file', async function (this: CustomWorld, fileType: string) {

});

Then('the system should reject the selected file', async function (this: CustomWorld) {

});

Then('the {string} message should not be displayed', async function (this: CustomWorld, message: string) {

});

Then('the user should not be able to upload the file', async function (this: CustomWorld) {

});

When('the user selects a valid resume file with exactly {int} MB size', async function (this: CustomWorld, fileSize: number) {

});

When('the user selects a valid resume file smaller than {int} MB', async function (this: CustomWorld, fileSize: number) {

});

When('the user selects a valid resume file larger than {int} MB', async function (this: CustomWorld, fileSize: number) {

});

Then('the system should display a file size validation message', async function (this: CustomWorld) {

});

Then('the user should not be able to upload the resume', async function (this: CustomWorld) {

});

Given('the user has an uploaded resume', async function (this: CustomWorld) {

});

Then('the {string} button should be displayed', async function (this: CustomWorld, buttonName: string) {

});

Then('the Delete button should be displayed', async function (this: CustomWorld) {

});

Then('the Download button should be displayed', async function (this: CustomWorld) {

});

Then('the Upload Resume button should not be displayed', async function (this: CustomWorld) {

});

When('the user clicks the {string} button', async function (this: CustomWorld, buttonName: string) {

});

Then( 'the existing resume should be replaced with the newly uploaded resume', async function (this: CustomWorld) {

});

Then('the updated resume should be displayed in the profile', async function (this: CustomWorld) {

});

When('the user selects an unsupported or oversized file', async function (this: CustomWorld) {

});

Then('the existing resume should remain unchanged', async function (this: CustomWorld) {

});

When('the user clicks the Delete button', async function (this: CustomWorld) {

});

When('the user confirms the deletion', async function (this: CustomWorld) {

});

Then('the resume should be removed successfully', async function (this: CustomWorld) {

});

Then('the {string} button should not be displayed', async function (this: CustomWorld, buttonName: string) {

});

When('the user cancels the deletion', async function (this: CustomWorld) {

});

Then('the delete confirmation popup should be closed', async function (this: CustomWorld) {

});

Then('the existing resume should remain available in the profile', async function (this: CustomWorld) {

});

When('the user clicks the Download button', async function (this: CustomWorld) {

});

Then('the resume should be opened in a new browser tab', async function (this: CustomWorld) {

});

Then( "the opened document should match the user's uploaded resume", async function (this: CustomWorld) {

});

Given('the user has successfully uploaded a resume', async function (this: CustomWorld) {

});

When('the user refreshes the profile page', async function (this: CustomWorld) {

});

Then('the uploaded resume should still be displayed', async function (this: CustomWorld) {

});

Given('the user has successfully updated the resume', async function (this: CustomWorld) {

});

Then('the updated resume should still be displayed', async function (this: CustomWorld) {

});

Given('the user has deleted the resume successfully', async function (this: CustomWorld) {

});

Then('no resume file should be displayed', async function (this: CustomWorld) {

});

Then('the {string} message should be displayed', async function (this: CustomWorld, message: string) {
  
});
