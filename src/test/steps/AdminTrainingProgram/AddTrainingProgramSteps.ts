import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../../main/support/CustomWorld";
import { CSVReader } from "../../../main/utils/csv_reader";
import { TrainingProgramData } from "../../../main/types/TrainingProgramData";
import { logger } from "../../../main/utils/logger";

const trainingProgramTestData =
    CSVReader.getData<TrainingProgramData>(
        "src/resources/data/addTrainingProgramData.csv"
    );

function getTrainingDataById(
    testCaseId: string
): TrainingProgramData {

    const row = trainingProgramTestData.find(
        (data) => data.testCaseId === testCaseId
    );

    if (!row) {
        throw new Error(
            `No test data found for testCaseId="${testCaseId}" ` +
            `in addTrainingProgramData.csv`
        );
    }

    return row;
}

function generateSessionDates(): {
    startDate: Date;
    endDate: Date;
} {
    const daysAhead =
        30 + Math.floor(Math.random() * 300);

    const durationDays =
        2 + Math.floor(Math.random() * 5);

    const startDate = new Date();

    startDate.setDate(
        startDate.getDate() + daysAhead
    );

    startDate.setHours(
        10,
        0,
        0,
        0
    );

    const endDate = new Date(startDate);

    endDate.setDate(
        endDate.getDate() + durationDays
    );

    return {
        startDate,
        endDate
    };
}

When(
    "the admin creates a training session using test data {string}",
    { timeout: 60 * 1000 },
    async function (
        this: CustomWorld,
        testCaseId: string
    ) {

        const data = getTrainingDataById(testCaseId);

        const {
            startDate,
            endDate
        } = generateSessionDates();

        await this.addTrainingProgramPage.createTrainingSession({
            title: data.title,
            description: data.description,
            trainerName: data.trainerName,
            trainerEmail: data.trainerEmail,
            capacity: data.capacity,
            startDate,
            endDate
        });
        this.lastCreatedTraining = {
            ...data,
            startDate,
            endDate
        };
    }
);


Then(
    "the training session should be created successfully",
    async function (this: CustomWorld) {

        await this.addTrainingProgramPage.waitForSuccessToast();
    }
);
When(
    "the admin attempts to create a training session using test data {string}",
    async function (
        this: CustomWorld,
        testCaseId: string
    ) {

        const data = getTrainingDataById(testCaseId);

        const {
            startDate,
            endDate
        } = generateSessionDates();

        await this.addTrainingProgramPage.createTrainingSession({
            title: data.title,
            description: data.description,
            trainerName: data.trainerName,
            trainerEmail: data.trainerEmail,
            capacity: data.capacity,
            startDate,
            endDate
        });
    }
);


Then(
    "the training session creation should be rejected",
    async function (this: CustomWorld) {

        const successToast =
            await this.addTrainingProgramPage.isSuccessToastVisible();

        const formStillOpen =
            await this.addTrainingProgramPage.isFormStillOpen();

        expect(
            successToast,
            "Invalid training data must not create a training session"
        ).toBe(false);

        expect(
            formStillOpen,
            "Expected the Add Training form to remain open"
        ).toBe(true);
    }
);

When(
    "the admin attempts to create a training session without selecting a trainer",
    async function (this: CustomWorld) {

        const data = getTrainingDataById("TC01");

        const {
            startDate,
            endDate
        } = generateSessionDates();

        await this.addTrainingProgramPage.createTrainingSession({
            title: data.title,
            description: data.description,
            capacity: data.capacity,
            startDate,
            endDate
        });
    }
);


Then(
    "the trainer required error message should be displayed",
    async function (this: CustomWorld) {

        const visible =
            await this.addTrainingProgramPage
                .isTrainerRequiredErrorVisible();

        expect(
            visible,
            'Expected "Trainer ID or Trainer IDs is required"'
        ).toBe(true);
    }
);

When(
    "the admin attempts to create a training session without a title",
    async function (this: CustomWorld) {

        const data = getTrainingDataById("TC01");

        const {
            startDate,
            endDate
        } = generateSessionDates();

        await this.addTrainingProgramPage.createTrainingSession({
            description: data.description,
            trainerName: data.trainerName,
            trainerEmail: data.trainerEmail,
            capacity: data.capacity,
            startDate,
            endDate
        });
    }
);


Then(
    "the browser should show a required-field validation message for the title field",
    async function (this: CustomWorld) {

        const message =
            await this.addTrainingProgramPage
                .getTitleValidationMessage();

        expect(
            message.length,
            `Expected a browser validation message for Title, ` +
            `but received "${message}"`
        ).toBeGreaterThan(0);
    }
);

When(
    "the admin attempts to create a training session without a start date",
    async function (this: CustomWorld) {

        const data = getTrainingDataById("TC01");

        const {
            endDate
        } = generateSessionDates();

        await this.addTrainingProgramPage.createTrainingSession({
            title: data.title,
            description: data.description,
            trainerName: data.trainerName,
            trainerEmail: data.trainerEmail,
            capacity: data.capacity,
            endDate
        });
    }
);


Then(
    "the browser should show a required-field validation message for the start date field",
    async function (this: CustomWorld) {

        const message =
            await this.addTrainingProgramPage
                .getStartDateValidationMessage();

        expect(
            message.length,
            `Expected a browser validation message for Start Date, ` +
            `but received "${message}"`
        ).toBeGreaterThan(0);
    }
);