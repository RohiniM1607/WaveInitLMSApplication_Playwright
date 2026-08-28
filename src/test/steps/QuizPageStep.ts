import { When, Then } from "@cucumber/cucumber";
import { expect } from "playwright/test";
import { CustomWorld } from "../../main/support/CustomWorld";
import quizData from "../../resources/data/quizDataset.json";

When(
    'The trainer clicks on the {string} menu',
    async function (this: CustomWorld, menuName: string) {
        await this.quizPage.clickSidebarMenu(menuName);
    }
);

When(
    'The trainer selects the course from the list',
    async function (this: CustomWorld) {
        await this.quizPage.selectFirstCourse();
    }
);

When(
    'The trainer clicks on the {string} tab',
    async function (this: CustomWorld, tabName: string) {
        await this.quizPage.clickTab(tabName);
    }
);

When(
    'The trainer clicks on the {string} button',
    async function (this: CustomWorld, buttonName: string) {
        await this.quizPage.clickButton(buttonName);
    }
);

When(
    'The trainer creates a quiz using the {string} dataset',
    async function (this: CustomWorld, datasetKey: string) {

        const data = quizData[datasetKey as keyof typeof quizData];

        if (!data) {
            throw new Error(`Dataset "${datasetKey}" was not found in quizDataset.json`);
        }

        this.currentQuizTitle = data.quizTitle;

        this.currentQuizQuestionCount = data.questions.length;

        await this.quizPage.enterQuizTitle(this.currentQuizTitle);

        for (let i = 0; i < data.questions.length; i++) {

            const question = data.questions[i];

            // First question already exists
            // Additional questions need Add Question button
            if (i > 0) {
                await this.quizPage.clickAddQuestion();
            }

            await this.quizPage.fillQuestion(
                i,
                question.questionText,
                question.options,
                question.correctAnswer
            );
        }
    }
);

Then(
    'The quiz should be listed with the correct number of questions and status {string}',
    async function (this: CustomWorld, status: string) {

        const quizRow = await this.quizPage.getQuizRow(
            this.currentQuizTitle!
        );

        expect(quizRow.questionCount).toBe(
            this.currentQuizQuestionCount
        );

        expect(quizRow.status).toBe(status);
    }
);
When(
    'The trainer deletes the quiz',
    async function (this: CustomWorld) {

        await this.quizPage.deleteQuiz(
            this.currentQuizTitle!
        );
    }
);

Then(
    'The quiz should not be listed anymore',
    async function (this: CustomWorld) {

        const isPresent =
            await this.quizPage.isQuizPresent(
                this.currentQuizTitle!
            );

        expect(isPresent).toBe(false);
    }
);