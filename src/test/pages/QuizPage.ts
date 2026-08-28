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

    /*
     * Locate quiz question textareas.
     *
     * nth(index) is still used, but only against the
     * question textarea collection instead of every
     * textarea on the page.
     */
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

        /*
         * Wait until the exact quiz row disappears
         * from the DOM.
         */
        await row.waitFor({
            state: "detached"
        });
    }

    async isQuizPresent(
        quizTitle: string
    ) {

        /*
         * Give the table a chance to finish updating.
         */
        await this.page.waitForLoadState("networkidle")
            .catch(() => {});

        return await this.quizRows(quizTitle).count() > 0;
    }
}