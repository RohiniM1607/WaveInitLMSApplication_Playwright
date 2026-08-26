import { expect } from "playwright/test";
import { logger } from "../../main/utils/logger";
import { BasePage } from "./BasePage";

export class LessonsPage extends BasePage {

    async navigateToMyTrainings() {
        logger.info("Navigating to My Trainings");
        // locator for My Trainings
    }

    async selectCourse(courseName: string) {
        logger.info(`Selecting course: ${courseName}`);
        // locator for course
    }

    async clickLessonsTab() {
        logger.info("Clicking on Lessons tab");
        // locator for Lessons
    }

    async isLessonsSectionDisplayed() {
        logger.info("Checking Lessons section");
        // return visibility
    }

    async isLearningContentDisplayed() {
        logger.info("Checking Learning Content section");
        // return visibility
    }

    async clickAddModule() {
        logger.info("Clicking Add Module button");
        // locator for Add Module
    }

    async enterValidModuleDetails() {
        logger.info("Entering valid module details");
        // actual fields will go here
    }

    async clickSave() {
        logger.info("Clicking Save button");
        // locator for Save
    }

    async isCreatedModuleDisplayed() {
        logger.info("Checking newly created module");
        // return visibility
    }

    async leaveMandatoryFieldsEmpty() {
        logger.info("Leaving mandatory module fields empty");
        // intentionally don't fill required fields
    }

    async isModuleValidationMessageDisplayed() {
        logger.info("Checking module validation message");
        // return visibility
    }

    async isModuleNotCreated() {
        logger.info("Verifying module was not created");
        // return appropriate assertion value
    }
}