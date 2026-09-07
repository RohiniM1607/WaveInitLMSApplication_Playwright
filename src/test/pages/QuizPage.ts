import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class QuizPage extends BasePage {

    // ================================
    // Navigation Locators
    // ================================

    private sidebarMenuItem = (menuName: string) =>
        this.page.locator(".wl-sidebar-item", {
            hasText: menuName
        });

    private firstCourseRow =
        this.page.locator(".wl-sidebar-course-item").first();

    private courseByName = (courseName: string) =>
        this.page.locator(".wl-sidebar-course-item", {
            hasText: courseName
        });

    private tab = (tabName: string) =>
        this.page.getByRole("tab", {
            name: tabName
        });


    // ================================
    // Quiz Creation Locators
    // ================================

    private createManuallyBtn =
        this.page.locator(".cqt-btn-manual");

    private addQuestionBtn =
        this.page.getByRole("button", {
            name: "Add question"
        });

    private saveDraftBtn =
        this.page.getByRole("button", {
            name: "Save as Draft"
        });

    private quizTitleInput =
        this.page.getByPlaceholder(
            "e.g. Module 2 Knowledge Check"
        );

    private questionTextarea = (index: number) =>
        this.page.locator(
            'textarea[placeholder*="question" i]'
        ).nth(index);

    private optionInput = (
        qIndex: number,
        optIndex: number
    ) =>
        this.page
            .locator(`input[name="q_${qIndex}_opt"]`)
            .nth(optIndex)
            .locator("xpath=following-sibling::input");

    private optionRadio = (
        qIndex: number,
        optIndex: number
    ) =>
        this.page
            .locator(`input[name="q_${qIndex}_opt"]`)
            .nth(optIndex);


    // ================================
    // Delete Quiz Locators
    // ================================

    private quizRows = (quizTitle: string) =>
        this.page
            .locator("table.cqt-table tbody tr")
            .filter({
                has: this.page.getByText(quizTitle, {
                    exact: true
                })
            });

    private quizRow = (quizTitle: string) =>
        this.quizRows(quizTitle).last();

    private confirmDeleteBtn =
        this.page.getByRole("button", {
            name: "Delete Permanently"
        });


    // ================================
    // Question Bank Search Locators
    // ================================

    private questionBankToggle =
        this.page.locator(".cqt-bank-toggle");

    private questionSearchInput =
        this.page.getByPlaceholder(
            "Search question text or source quiz…"
        );

    private searchResultsList =
        this.page.locator('div[style*="max-height: 300px"]');

    private searchResultItem = (questionText: string) =>
        this.searchResultsList
            .locator("> div")
            .filter({
                hasText: questionText
            });
    private noResultsMessage =
    this.page.getByText(
        "No questions found in this course's quizzes."
    );

    // ================================
    // Navigation Methods
    // ================================

    async clickSidebarMenu(menuName: string) {

        logger.info(
            `Clicking sidebar menu: ${menuName}`
        );

        await this.click(
            this.sidebarMenuItem(menuName)
        );
    }

    async selectFirstCourse() {

        logger.info(
            "Selecting first course from the list"
        );

        await this.click(
            this.firstCourseRow
        );
    }

    async selectCourseByName(courseName: string) {

        logger.info(
            `Selecting course: ${courseName}`
        );

        await this.click(
            this.courseByName(courseName)
        );
    }

    async clickTab(tabName: string) {

        logger.info(
            `Clicking tab: ${tabName}`
        );

        await this.click(
            this.tab(tabName)
        );
    }


    // ================================
    // Quiz Creation Methods
    // ================================

    async clickCreateManually() {

        logger.info(
            "Clicking Create Manually button"
        );

        await this.click(
            this.createManuallyBtn
        );
    }

    async enterQuizTitle(title: string) {

        logger.info(
            `Entering quiz title: ${title}`
        );

        await this.fill(
            this.quizTitleInput,
            title
        );
    }

    async clickAddQuestion() {

        logger.info(
            "Adding a new question"
        );

        const currentCount =
            await this.questionTextareaCount();

        await this.click(
            this.addQuestionBtn
        );

        await this.page.waitForFunction(
            (expectedCount) => {
                return document.querySelectorAll(
                    'textarea[placeholder*="question" i]'
                ).length >= expectedCount;
            },
            currentCount + 1
        );
    }

    private async questionTextareaCount() {

        return await this.page
            .locator(
                'textarea[placeholder*="question" i]'
            )
            .count();
    }

    async fillQuestion(
        index: number,
        questionText: string,
        options: string[],
        correctAnswer: string
    ) {

        logger.info(
            `Filling question ${index + 1}: ${questionText}`
        );

        await this.questionTextarea(index).waitFor({
            state: "visible"
        });

        await this.fill(
            this.questionTextarea(index),
            questionText
        );

        for (
            let i = 0;
            i < options.length;
            i++
        ) {

            await this.fill(
                this.optionInput(index, i),
                options[i]
            );

            if (
                options[i] === correctAnswer
            ) {

                await this.check(
                    this.optionRadio(index, i)
                );
            }
        }
    }


    // ================================
    // Generic Button Method
    // ================================

    async clickButton(
        buttonName: string
    ) {

        logger.info(
            `Clicking button: ${buttonName}`
        );

        if (
            buttonName === "Save as Draft"
        ) {

            await this.click(
                this.saveDraftBtn
            );

        } else if (
            buttonName === "Create Manually"
        ) {

            await this.clickCreateManually();

        } else {

            await this.click(
                this.page.getByRole(
                    "button",
                    {
                        name: buttonName
                    }
                )
            );
        }
    }


    // ================================
    // Quiz Validation
    // ================================

    async getQuizRow(
        quizTitle: string
    ) {

        const row =
            this.quizRow(quizTitle);

        await row.waitFor({
            state: "visible"
        });

        const questionCountText =
            await row
                .locator("td.cqt-cell-num")
                .textContent();

        const statusText =
            await row
                .locator(".cqt-badge")
                .first()
                .textContent();

        return {

            questionCount:
                Number(
                    questionCountText?.trim()
                ),

            status:
                statusText?.trim()
        };
    }


    // ================================
    // Delete Quiz Methods
    // ================================

    async deleteQuiz(
        quizTitle: string
    ) {

        logger.info(
            `Deleting quiz: ${quizTitle}`
        );

        const row =
            this.quizRow(quizTitle);

        await row.waitFor({
            state: "visible"
        });

        await this.click(
            row.locator(".cqt-action-btn--delete")
        );

        await this.confirmDeleteBtn.waitFor({
            state: "visible"
        });

        await this.click(
            this.confirmDeleteBtn
        );

        await row.waitFor({
            state: "detached"
        });
    }

    async isQuizPresent(
        quizTitle: string
    ) {

        await this.page.waitForLoadState("networkidle")
            .catch(() => { });

        return await this.quizRows(quizTitle).count() > 0;
    }


    // ================================
    // Question Bank Search Methods
    // ================================

    async openQuestionBank() {

        logger.info("Opening question bank");

        await this.questionBankToggle.waitFor({
            state: "visible",
            timeout: 10000
        });

        const alreadyOpen =
            await this.questionSearchInput.isVisible().catch(() => false);

        if (!alreadyOpen) {

            await this.questionBankToggle.scrollIntoViewIfNeeded();

            await this.click(
                this.questionBankToggle
            );

            await this.questionSearchInput.waitFor({
                state: "visible",
                timeout: 10000
            });
        }

        logger.info("Question bank opened successfully");
    }

    async searchQuestionBank(keyword: string) {

        logger.info(
            `Searching question bank for: ${keyword}`
        );

        await this.fill(
            this.questionSearchInput,
            keyword
        );
    }

    async isQuestionInResults(
        questionText: string,
        sourceQuiz: string
    ) {
        const result =
            this.searchResultItem(questionText).first();

        await result.waitFor({ state: "visible" });
        await result.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(2500); // watch it settle here

        const resultText = await result.textContent();
        return resultText?.includes(`From: ${sourceQuiz}`) ?? false;
    }
    async isNoResultsMessageDisplayed() {

    logger.info(
        "Verifying 'No questions found' message is displayed"
    );

    await this.noResultsMessage.waitFor({
        state: "visible",
        timeout: 10000
    });

    await this.noResultsMessage.scrollIntoViewIfNeeded();

    await this.page.waitForTimeout(2500); // watch it settle here

    return await this.noResultsMessage.isVisible();
}
}