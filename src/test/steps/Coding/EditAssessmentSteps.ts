import { When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../../../main/support/CustomWorld";
import { EditCodingVar} from "../../../main/types/EditCodingVar";
import { CSVReader } from "../../../main/utils/csv_reader";

const editCodingData = CSVReader.getData<EditCodingVar>("src/resources/data/editCodingData.csv");

When("the trainer clicks the Edit button for an existing coding assessment", async function (this: CustomWorld) {
    const data = editCodingData[0];
    await this.codingPage.clickEdit(data.existingTitle);
    
});

When("the trainer clicks the Edit button in the assessment details", async function (this: CustomWorld){
    await this.editAssessmentPage.clickEditButton();
    
})

When("the trainer updates the assessment title", async function (this: CustomWorld) {
    const data = editCodingData[0];
    await this.editAssessmentPage.updateAssessmentTitle(data.updatedTitle);
});

When("the trainer updates the multiple assessment details", async function (this: CustomWorld) {
    const data = editCodingData[1];
    await this.editAssessmentPage.updateAssessmentDetails(data.updatedTitle, data.updatedDescription,data.updatedDuration);
});

When("the trainer clicks the Save button", async function (this: CustomWorld) {
    await this.editAssessmentPage.clickSaveButton();
});

Then("the updated assessment title should be displayed in the assessment list", async function (this: CustomWorld) {
    const data = editCodingData[0];
    await this.editAssessmentPage.verifyUpdatedTitle(data.updatedTitle);
});

Then("the updated assessment details should be displayed correctly", async function (this: CustomWorld) {
    const data = editCodingData[1];
    await this.editAssessmentPage.verifyUpdatedDetails(data.updatedTitle,data.updatedDescription,data.updatedDuration);
});

Then("the assessment should remain unchanged",async function (this: CustomWorld) {
    const data = editCodingData[2];
    await this.editAssessmentPage.verifyAssessmentUnchanged(data.existingTitle);
});

When("the trainer clears the assessment title",async function (this: CustomWorld) {
    await this.editAssessmentPage.clearAssessmentTitle();
});

Then("the assessment title validation message should be displayed", async function (this: CustomWorld) {
    await this.editAssessmentPage.verifyTitleValidationMessage();
});

When("the trainer clicks the Cancel button", async function (this: CustomWorld) {
    await this.editAssessmentPage.clickCancelButton();
});

Then("the original assessment title should remain unchanged", async function (this: CustomWorld) {
    const data = editCodingData[4];
    await this.editAssessmentPage.verifyOriginalTitle(data.existingTitle);
});