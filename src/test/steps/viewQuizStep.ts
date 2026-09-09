import { When, Then } from "@cucumber/cucumber";
import { expect } from "playwright/test";
import { CustomWorld } from "../../main/support/CustomWorld";

When(
    'The trainer clicks the {string} icon for the quiz {string}',
    async function (this: CustomWorld, iconName: string, quizTitle: string) {
        if (iconName === "View Quiz Details") {
            await this.quizPage.clickViewQuizDetails(quizTitle);
        }
    }
);

Then(
    'The quiz details modal should show the title {string}',
    async function (this: CustomWorld, quizTitle: string) {
        const title = await this.quizPage.getDetailsModalTitle();
        expect(title).toBe(quizTitle);
    }
);

Then(
    'The quiz details modal should show {string} questions and status {string}',
    async function (this: CustomWorld, questionCount: string, status: string) {
        const isDisplayed = await this.quizPage.isDetailsModalStatusDisplayed(
            questionCount,
            status
        );
        expect(isDisplayed).toBe(true);
    }
);

Then(
    'The quiz details modal should show {string} as the duration',
    async function (this: CustomWorld, duration: string) {
        const value = await this.quizPage.getDetailsModalStatValue("Duration");
        expect(value).toContain(duration);
    }
);

Then(
    'The quiz details modal should show {string} as the passing marks',
    async function (this: CustomWorld, passingMarks: string) {
        const value = await this.quizPage.getDetailsModalStatValue("Passing Marks");
        expect(value).toContain(passingMarks);
    }
);

When(
    'The trainer closes the quiz details modal',
    async function (this: CustomWorld) {
        await this.quizPage.closeDetailsModal();
    }
);