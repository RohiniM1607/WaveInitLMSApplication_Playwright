import { DashboardPage } from './../../test/pages/DashboardPage';
import { BrowserContext, Browser, Page } from "@playwright/test";
import { World, setWorldConstructor } from "@cucumber/cucumber";
import { LoginPage } from "../../test/pages/LoginPage";
import { QuizPage } from "../../test/pages/QuizPage";
import { DiscussionPage } from "../../test/pages/DiscussionPage";
import { CodingPage } from '../../test/pages/Coding/CodingPage';
import { SignUpPage } from '../../test/pages/SignUpPage';
import { SidebarPage } from '../../test/pages/SidebarPage';
import { MyProfilePage } from '../../test/pages/MyProfilePage';
import { AssessmentPage } from '../../test/pages/Coding/AssessmentPage';

import { LessonsPage } from '../../test/pages/Lessons/LessonsPage';
import { ExploreCoursesPage } from '../../test/pages/ExploreCoursesPage';

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
    lastPostedMessages!: string[];
    replyMessages?: Record<string, string>;
    lessonsPage!: LessonsPage;
    codingPage!: CodingPage;
    signUpPage!: SignUpPage;
    sidebarPage!: SidebarPage;
    myProfilePage!: MyProfilePage;
    assessmentPage!: AssessmentPage;
    exploreCoursesPage!: ExploreCoursesPage;
    courseStatuses!: string[];
}

setWorldConstructor(CustomWorld);
