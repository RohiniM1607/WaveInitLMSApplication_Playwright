import { DashboardPage } from './../../test/pages/DashboardPage';
import { BrowserContext, Browser, Page } from "@playwright/test";
import { World, setWorldConstructor } from "@cucumber/cucumber";
import { LoginPage } from "../../test/pages/LoginPage";

export class CustomWorld extends World {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    loginPage!: LoginPage;
    dashboardPage!: DashboardPage;
}

setWorldConstructor(CustomWorld);
