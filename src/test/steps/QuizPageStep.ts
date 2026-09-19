import { When, Then } from "@cucumber/cucumber";
import { expect } from "playwright/test";
import { CustomWorld } from "../../main/support/CustomWorld";
import quizData from "../../resources/data/quizDataset.json";
import loginData from "../../resources/data/loginDataset.json";
When(
    'The user enters valid username and password for {string}',
    async function (this: CustomWorld, datasetKey: string) {
        const testData = loginData[datasetKey as keyof typeof loginData];
        await this.loginPage.fillUsername(testData.username);
        await this.loginPage.fillPassword(testData.password);
    }
);
When(
    'The trainer selects the course from the list',
    async function (this: CustomWorld) {
        await this.quizPage.selectFirstCourse();
    }
);
When(
    'The trainer clicks on the {string} menu',
    async function (this: CustomWorld, menuName: string) {
        await this.quizPage.clickSidebarMenu(menuName);
    }
);
When(
    'The trainer selects the course {string} from the list',
    async function (this: CustomWorld, courseName: string) {
        await this.quizPage.selectCourseByName(courseName);
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

When(
    'The trainer opens the question bank',
    async function (this: CustomWorld) {
        await this.quizPage.openQuestionBank();
    }
);

When(
    'The trainer searches the question bank for {string}',
    async function (this: CustomWorld, keyword: string) {
        await this.quizPage.searchQuestionBank(keyword);
    }
);

Then(
    'The search results should contain {string} from {string}',
    async function (this: CustomWorld, questionText: string, sourceQuiz: string) {
        const isPresent = await this.quizPage.isQuestionInResults(questionText, sourceQuiz);
        expect(isPresent).toBe(true);
    }
);
Then(
    'The search results should show no questions found message',
    async function (this: CustomWorld) {
        const isDisplayed = await this.quizPage.isNoResultsMessageDisplayed();
        expect(isDisplayed).toBe(true);
    }
);