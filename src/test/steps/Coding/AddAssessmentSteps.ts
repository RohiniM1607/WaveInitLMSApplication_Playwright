import { Given, When, Then } from '@cucumber/cucumber';
import {CustomWorld} from "../../../main/support/CustomWorld"
import loginData from "../../../resources/data/loginDataset.json"

let previousAssessmentCount: number;

Given('the user logs in with {string} role', async function (this: CustomWorld, role: string) {  
    await this.loginPage.clickLogin(role);
    const testData = loginData[`valid${role}` as keyof typeof loginData];
    await this.loginPage.login(testData.username, testData.password);
});

Given('the trainer is in the {string} course', async function(this: CustomWorld, course: string){
    await this.codingPage.selectCourse(course);
});

Given('the trainer is in the Coding module', async function (this: CustomWorld) {
    await this.codingPage.navigateToCodingModule();
});

When('the trainer clicks on the Create Assessment button', async function (this: CustomWorld) {
        previousAssessmentCount =await this.codingPage.getAssessmentCount();
        await this.codingPage.clickCreateAssessment();
    }
);

Then('a new coding assessment should be added to the assessment list', async function (this: CustomWorld) {
    await this.codingPage.verifyAssessmentAdded(previousAssessmentCount);
});

When('the trainer clicks on the Generate with AI button', async function (this: CustomWorld) {
        await this.codingPage.clickGenerateWithAI();
    }
);

When('the trainer enters the assessment details', async function (this: CustomWorld) {
        await this.assessmentPage.enterAssessmentDetails();
    }
);

When('the trainer clicks on the Generate Assessment button', async function (this: CustomWorld) {
        await this.assessmentPage.clickGenerateAssessment();
    }
);