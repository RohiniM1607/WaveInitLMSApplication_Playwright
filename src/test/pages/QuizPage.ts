import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class QuizPage extends BasePage {

    // Navigation locators
    private sidebarMenuItem = (menuName: string) =>
        this.page.locator('.wl-sidebar-item', { hasText: menuName });

    private firstCourseRow = this.page.locator('.wl-sidebar-course-item').first();

    private tab = (tabName: string) =>
        this.page.getByRole('tab', { name: tabName });

    // Quiz creation locators
    private createManuallyBtn = this.page.locator('.cqt-btn-manual');
    private addQuestionBtn = this.page.getByRole('button', { name: 'Add question' });
    private saveDraftBtn = this.page.getByRole('button', { name: 'Save as Draft' });
    private quizTitleInput = this.page.getByPlaceholder('e.g. Module 2 Knowledge Check');

    private questionTextarea = (index: number) =>
        this.page.locator('textarea').nth(index);

    private optionInput = (qIndex: number, optIndex: number) =>
        this.page.locator(`input[name="q_${qIndex}_opt"]`).nth(optIndex)
            .locator('xpath=following-sibling::input');

    private optionRadio = (qIndex: number, optIndex: number) =>
        this.page.locator(`input[name="q_${qIndex}_opt"]`).nth(optIndex);

    // --- Navigation methods ---

    async clickSidebarMenu(menuName: string) {
        logger.info(`Clicking sidebar menu: ${menuName}`);
        await this.click(this.sidebarMenuItem(menuName));
    }

    async selectFirstCourse() {
        logger.info("Selecting first course from the list");
        await this.click(this.firstCourseRow);
    }

    async clickTab(tabName: string) {
        logger.info(`Clicking tab: ${tabName}`);
        await this.click(this.tab(tabName));
    }

    // --- Quiz creation methods ---

    async clickCreateManually() {
        logger.info("Clicking Create Manually button");
        await this.click(this.createManuallyBtn);
    }

    async enterQuizTitle(title: string) {
        logger.info(`Entering quiz title: ${title}`);
        await this.fill(this.quizTitleInput, title);
    }

    async clickAddQuestion() {
        logger.info("Adding a new question");
        await this.click(this.addQuestionBtn);
    }

    async fillQuestion(index: number, questionText: string, options: string[], correctAnswer: string) {
        logger.info(`Filling question ${index + 1}: ${questionText}`);
        await this.fill(this.questionTextarea(index), questionText);

        for (let i = 0; i < options.length; i++) {
            await this.fill(this.optionInput(index, i), options[i]);
            if (options[i] === correctAnswer) {
                await this.check(this.optionRadio(index, i));
            }
        }
    }

    async clickButton(buttonName: string) {
        logger.info(`Clicking button: ${buttonName}`);
        if (buttonName === 'Save as Draft') {
            await this.click(this.saveDraftBtn);
        } else if (buttonName === 'Create Manually') {
            await this.clickCreateManually();
        } else {
            await this.click(this.page.getByRole('button', { name: buttonName }));
        }
    }

    async getQuizRow(quizTitle: string) {
        const row = this.page.locator('table.cqt-table tbody tr', { hasText: quizTitle });
        const questionCountText = await row.locator('td.cqt-cell-num').textContent();
        const statusText = await row.locator('.cqt-badge').first().textContent();
        return {
            questionCount: Number(questionCountText?.trim()),
            status: statusText?.trim()
        };
    }
}