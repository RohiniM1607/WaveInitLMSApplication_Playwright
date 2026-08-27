import { CustomWorld } from './../../../main/support/CustomWorld';
import { When, Then } from "@cucumber/cucumber";
import { expect } from "playwright/test";
import lessonsData from "../../../resources/data/lessonsData.json";

const COURSE_NAME = lessonsData.course.name;

const RUN_SUFFIX = Date.now();
const VALID_MODULE = {
    ...lessonsData.module.valid,
    moduleName: `${lessonsData.module.valid.moduleName} ${RUN_SUFFIX}`
};

When(
    "The trainer navigates to My Trainings",
    async function (this: CustomWorld) {
        await this.lessonsPage.navigateToMyTrainings();
    }
);

When(
    "The trainer selects the course",
    async function (this: CustomWorld) {
        await this.lessonsPage.selectCourse(COURSE_NAME);
    }
);

When(
    "The trainer clicks on the Lessons tab",
    async function (this: CustomWorld) {
        await this.lessonsPage.clickLessonsTab();
    }
);

Then(
    "The Lessons section should be displayed",
    async function (this: CustomWorld) {
        const isDisplayed =
            await this.lessonsPage.isLessonsSectionDisplayed();

        expect(isDisplayed).toBe(true);
    }
);

Then(
    'The "Learning Content" section should be displayed',
    async function (this: CustomWorld) {
        const isDisplayed =
            await this.lessonsPage.isLearningContentDisplayed();

        expect(isDisplayed).toBe(true);
    }
);


When(
    'The trainer clicks the "Add Module" button in Lessons',
    async function (this: CustomWorld) {
        await this.lessonsPage.clickAddModule();
    }
);

When(
    "The trainer enters valid module details",
    async function (this: CustomWorld) {
        await this.lessonsPage.enterValidModuleDetails(
            VALID_MODULE.moduleName,
            VALID_MODULE.description
        );
    }
);

When(
    'The trainer clicks the "Save" button in Lessons',
    async function (this: CustomWorld) {
        await this.lessonsPage.clickSave();
    }
);

Then(
    "The newly created module should be displayed in the Learning Content section",
    async function (this: CustomWorld) {
        const isDisplayed =
            await this.lessonsPage.isCreatedModuleDisplayed(
                VALID_MODULE.moduleName
            );

        expect(isDisplayed).toBe(true);
    }
);

When(
    "The trainer leaves the mandatory module fields empty",
    async function (this: CustomWorld) {
        await this.lessonsPage.leaveMandatoryFieldsEmpty();
    }
);

Then(
    "The module validation message should be displayed",
    async function (this: CustomWorld) {
        const isDisplayed =
            await this.lessonsPage.isModuleValidationMessageDisplayed();

        expect(isDisplayed).toBe(true);
    }
);

Then(
    "The module should not be created",
    async function (this: CustomWorld) {
        const isNotCreated =
            await this.lessonsPage.isModuleNotCreated(
                VALID_MODULE.moduleName
            );

        expect(isNotCreated).toBe(true);
    }
);