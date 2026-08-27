import { expect } from 'playwright/test';
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../main/support/CustomWorld';

Given('The user navigates to the social link management page', async function (this: CustomWorld) {
    await this.sidebarPage.clickMyProfileLink();
});

When('The user clicks on the Edit button in the social link section', async function (this: CustomWorld) {
    await this.myProfilePage.clickEditSocialLinksButton();
});

When('The user enters valid details in the social link form', async function (this: CustomWorld, dataTable: any) {
    const socialLinks = dataTable.rowsHash();
    for (const [socialMedia, link] of Object.entries(socialLinks)) {
        await this.myProfilePage.fillSocialLink(socialMedia, link as string);
    }
});

When('The user clicks the Save button', async function (this: CustomWorld) {
    await this.myProfilePage.clickSaveLinksButton();
});

Then('The edited social link should be updated in the user\'s profile', async function (this: CustomWorld, dataTable: any) {
    const socialLinks = dataTable.rowHash();
    for (const [socialMedia, link] of Object.entries(socialLinks)) {
        expect(await this.myProfilePage.isSocialLinkVisible(link as string)).toBeTruthy();
    }
});

When('The user clicks the {string} social media link in the profile section',async function (this: CustomWorld, socialMedia: string) {
    await this.myProfilePage.clickSocialLink(socialMedia);
});

Then('The user should be redirected to the {string} page', async function (this: CustomWorld, website: string) {
    expect(await this.myProfilePage.getCurrentPageUrl()).toContain(website.toLowerCase());
});