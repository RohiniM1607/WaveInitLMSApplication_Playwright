import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { CustomWorld } from "../../main/support/CustomWorld";
import { TrainingProgramStatus } from "../pages/TrainingProgramPage";


Given(
    "the admin navigates to the Training Program page",
    async function (this: CustomWorld) {

        await this.trainingProgramPage.navigateToTrainingProgram();
    }
);


When(
    "the admin selects the {string} status filter",
    async function (
        this: CustomWorld,
        status: string
    ) {

        const validStatuses: TrainingProgramStatus[] = [
            "Active",
            "Upcoming",
            "Completed",
            "All"
        ];

        const normalizedStatus =
            status.trim();

        if (
            !validStatuses.includes(
                normalizedStatus as TrainingProgramStatus
            )
        ) {
            throw new Error(
                `Invalid Training Program status: "${status}". ` +
                `Expected one of: ${validStatuses.join(", ")}`
            );
        }

        await this.trainingProgramPage.selectStatusFilter(
            normalizedStatus as TrainingProgramStatus
        );
    }
);


Then(
    "every listed training program should have the status {string}",
    async function (
        this: CustomWorld,
        status: string
    ) {

        const result =
            await this.trainingProgramPage.areAllRowsOfStatus(
                status.trim() as Exclude<
                    TrainingProgramStatus,
                    "All"
                >
            );

        expect(
            result,
            `Expected every training program to have status "${status}"`
        ).toBe(true);
    }
);


Then(
    "the training program list should include the status {string}",
    async function (
        this: CustomWorld,
        status: string
    ) {

        const result =
            await this.trainingProgramPage.listIncludesStatus(
                status.trim() as Exclude<
                    TrainingProgramStatus,
                    "All"
                >
            );

        expect(
            result,
            `Expected training program list to include status "${status}"`
        ).toBe(true);
    }
);


Then(
    "the training program list should not include the status {string}",
    async function (
        this: CustomWorld,
        status: string
    ) {

        const result =
            await this.trainingProgramPage.listDoesNotIncludeStatus(
                status.trim() as Exclude<
                    TrainingProgramStatus,
                    "All"
                >
            );

        expect(
            result,
            `Expected training program list not to include status "${status}"`
        ).toBe(true);
    }
);


Then(
    "the training program list should contain all available statuses",
    async function (this: CustomWorld) {

        const expectedStatuses = [
            "Active",
            "Upcoming",
            "Completed"
        ];

        const result =
            await this.trainingProgramPage.listIncludesAllStatuses(
                expectedStatuses
            );

        expect(
            result,
            `Expected training program list to contain all statuses: ${
                expectedStatuses.join(", ")
            }`
        ).toBe(true);
    }
);