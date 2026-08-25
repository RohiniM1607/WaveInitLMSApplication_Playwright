import { DashboardPage } from './../../test/pages/DashboardPage';
import { BrowserContext, Browser, Page } from "@playwright/test";
import { World, setWorldConstructor } from "@cucumber/cucumber";
import { LoginPage } from "../../test/pages/LoginPage";
import { QuizPage } from "../../test/pages/QuizPage";
import { DiscussionPage } from "../../test/pages/DiscussionPage";

export class CustomWorld extends World {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    loginPage!: LoginPage;
    dashboardPage!: DashboardPage;
    quizPage!: QuizPage;
    currentQuizTitle?: string;
    currentQuizQuestionCount?: number;
    discussionPage!: DiscussionPage;
    lastPostedMessage!: string;
}

setWorldConstructor(CustomWorld);
