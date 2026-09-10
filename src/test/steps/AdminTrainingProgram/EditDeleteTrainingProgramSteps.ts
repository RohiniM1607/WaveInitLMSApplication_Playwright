import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../../main/support/CustomWorld";
import { CSVReader } from "../../../main/utils/csv_reader";
import { TrainingProgramRowData } from "../../pages/AdminTrainingPragram/TrainingProgramPage";

interface EditDeleteTrainingProgramData extends TrainingProgramRowData {
    testCaseId: string;
}

const trainingProgramData = CSVReader.getData<EditDeleteTrainingProgramData>(
    "src/resources/data/editDeleteTrainingProgramData.csv"
);

function getTarget(testCaseId: string): TrainingProgramRowData {
    const target = trainingProgramData.find(data => data.testCaseId === testCaseId);
    if (!target) {
        throw new Error(`No edit/delete training data found for "${testCaseId}"`);
    }
    return target;
}

When("the admin opens the existing training program for editing", async function (this: CustomWorld) {
    const editTarget = getTarget("EDIT01");

    console.log("STEP 1: Target data:", editTarget);

    console.log("STEP 2: Checking training program row");
    await this.trainingProgramPage.expectProgramRowVisible(editTarget);

    console.log("STEP 3: Row found, opening Edit");
    await this.trainingProgramPage.openEditTraining(editTarget);

    console.log("STEP 4: Edit form opened");
});

Then("the existing training program values should be loaded", async function (this: CustomWorld) {
    const editTarget = getTarget("EDIT01");
    const values = await this.trainingProgramPage.getEditFormValues();
    expect(values.title).toBe(editTarget.title);
    expect(values.startDate).toContain(editTarget.startDate.split("T")[0]);
expect(values.endDate).toContain(editTarget.endDate.split("T")[0]);
    expect(values.capacity).toBe(editTarget.capacity);
});

When("the admin updates the supported training program fields", async function (this: CustomWorld) {
    await this.trainingProgramPage.fillEditTraining({
        title: "Node.js Fundamentals 1789040988125 Edited",
        description: "Updated training objectives and content overview",
        startDate: "2027-02-10T10:00",
        endDate: "2027-02-14T10:00",
        capacity: "30"
    });
});

When("the admin saves the edited training program", async function (this: CustomWorld) {
    await this.trainingProgramPage.saveEditedTraining();
});

Then("the edit should show the known training update server error", async function (this: CustomWorld) {
    await this.trainingProgramPage.expectEditUpdateError();
});

When("the admin clears the training program title and saves", async function (this: CustomWorld) {
    await this.trainingProgramPage.fillEditTraining({ title: "" });
    await this.trainingProgramPage.saveEditedTraining();
});

Then("the edit title should have a required field validation message", async function (this: CustomWorld) {
    const message = await this.trainingProgramPage.getTitleValidationMessage();
    expect(message.length).toBeGreaterThan(0);
});

When("the admin opens the existing training program deletion confirmation", async function (this: CustomWorld) {
    const deleteTarget = getTarget("DELETE01");
    await this.trainingProgramPage.expectProgramRowVisible(deleteTarget);
    await this.trainingProgramPage.openDeleteConfirmation(deleteTarget);
});

Then("the delete confirmation should identify the selected training program", async function (this: CustomWorld) {
    const deleteTarget = getTarget("DELETE01");
    await expect(this.page.getByText(`Delete training "${deleteTarget.title}"?`, { exact: true })).toBeVisible();
    await expect(this.page.getByText("This will remove all associated enrollments and feedback.", { exact: true })).toBeVisible();
});

When("the admin cancels the training program deletion", async function (this: CustomWorld) {
    await this.trainingProgramPage.cancelDelete();
});

Then("the selected training program should remain displayed", async function (this: CustomWorld) {
    const deleteTarget = getTarget("DELETE01");
    await this.trainingProgramPage.expectProgramRowVisible(deleteTarget);
});

When("the admin confirms the training program deletion", async function (this: CustomWorld) {
    await this.trainingProgramPage.confirmDelete();
});

Then("the deleted training program should no longer be displayed", async function (this: CustomWorld) {
    const deleteTarget = getTarget("DELETE01");
    await this.trainingProgramPage.expectProgramRowAbsent(deleteTarget);
});