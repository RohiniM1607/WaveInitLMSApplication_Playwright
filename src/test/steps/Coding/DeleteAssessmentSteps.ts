import { CustomWorld } from './../../../main/support/CustomWorld';
import { When, Then } from "@cucumber/cucumber";
import { DeleteCodingVar } from '../../../main/types/DeleteCodingVar';

When('the trainer clicks the Delete button for the coding assessment',async function (this: CustomWorld, dataTable) {
    const data: DeleteCodingVar = dataTable.hashes()[0];
    this.deleteCodingVar = {assessmentTitle: data.assessmentTitle,assessmentCountBeforeDelete:await this.codingPage.getAssessmentCount()};
    await this.codingPage.clickDeleteAssessment(data.assessmentTitle);
});

When('the trainer clicks the Confirm button in the confirmation dialog', async function (this: CustomWorld) {
    await this.deleteConfirmationPage.clickConfirm();
});

When('the trainer clicks the Cancel button in the confirmation dialog', async function (this: CustomWorld) {
    await this.deleteConfirmationPage.clickCancel();
});

Then('the coding assessment should be deleted from the assessment list', async function (this: CustomWorld) {
    const previousCount = this.deleteCodingVar.assessmentCountBeforeDelete;
    await this.codingPage.verifyAssessmentCount(previousCount,previousCount - 1
    );
});

Then('the coding assessment should remain in the assessment list', async function (this: CustomWorld) {
    const previousCount = this.deleteCodingVar.assessmentCountBeforeDelete;
    await this.codingPage.verifyAssessmentCount(previousCount,previousCount);
});