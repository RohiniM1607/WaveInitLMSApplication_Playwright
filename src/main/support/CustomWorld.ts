import { BrowserContext, Browser, Page } from "@playwright/test";
import { LoginPage } from "../../test/pages/LoginPage";
import { CourseStructurePage } from "../../test/pages/CourseStructurePage";
import { World, setWorldConstructor } from "@cucumber/cucumber";
import { CourseCategoryPage } from "../../test/pages/CourseCategoryPage";
import { DynamicFieldManagementPage } from "../../test/pages/DynamicFieldManagementPage";
import { AddCoursePage } from "../../test/pages/AddCoursePage";
import { SidebarPage } from "../../test/pages/SidebarPage";
import { ServiceModelPage } from "../../test/pages/ServiceModelPage";
import { Service } from "../types/Service";
import { SearchCoursePage } from "../../test/pages/SearchCoursePage";
import { CourseFilterPage } from "../../test/pages/CourseFilterPage";
import { EditCoursePage } from "../../test/pages/EditCoursePage";
import { PedagogyPage } from "../../test/pages/PedagogyPage";

export class CustomWorld extends World {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    loginPage!: LoginPage;
    courseCategoryPage!: CourseCategoryPage;
    dynamicFieldManagementPage!: DynamicFieldManagementPage;
    sidebarPage!: SidebarPage;
    serviceModelPage!: ServiceModelPage;
    courseStructurePage!: CourseStructurePage;
    addCoursePage!: AddCoursePage;
    service!: Service
    searchCoursePage!: SearchCoursePage;
    courseFilterPage!: CourseFilterPage;
    editCoursePage!: EditCoursePage;
    pedagogyPage!:PedagogyPage;
}

setWorldConstructor(CustomWorld);
