import {When, Then} from "@cucumber/cucumber";
import { CustomWorld } from "../../main/support/CustomWorld";
import { expect } from "playwright/test";
import { logger } from "../../main/utils/logger";


let fileChooser: any;

When('The user clicks on the camera icon in the profile picture section', async function (this: CustomWorld) {
    await this.myProfilePage.clickProfileUploadButton();
});

When('The user clicks on the Choose Image button', async function (this: CustomWorld) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.myProfilePage.clickChooseImageButton();
    fileChooser = await fileChooserPromise;
});

When('The user selects a valid image file from the local system', async function (this: CustomWorld) {
    await fileChooser.setFiles('src/resources/data/Images/ValidSizeImage.png');
});

When('The user clicks the Save Photo button', async function (this: CustomWorld) {
    await this.myProfilePage.clickSaveProfileButton();
});

Then('The uploaded profile picture should be displayed in the user\'s profile', async function (this: CustomWorld) {
    await this.myProfilePage.isProfileImageVisible();
});

When('The user selects an invalid file type from the local system', async function (this: CustomWorld) {
    await fileChooser.setFiles('src/resources/data/Images/InvalidFileFormat.pdf');
});

Then('An error message should be displayed indicating {string}', async function (this: CustomWorld, expectedMessage: string) {
  
});

When('The user selects an image file exceeding the size limit from the local system', async function (this: CustomWorld) {
    await fileChooser.setFiles('src/resources/data/Images/InvalidSizeImage.jpg');
    
});

Then('The first two letters of the username should be displayed in the user\'s profile', async function (this: CustomWorld) {
    const usernameInitials = await this.myProfilePage.getUsernameInitials();
    const username = await this.myProfilePage.getUsername();
    const expectedInitials = username.substring(0, 2).toUpperCase();
    expect(usernameInitials).toBe(expectedInitials);
});

When('The user clicks on the Remove Photo button', async function (this: CustomWorld) {
    await this.myProfilePage.clickRemoveProfileButton();
})


