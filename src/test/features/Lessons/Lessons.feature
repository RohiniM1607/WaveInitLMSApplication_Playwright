@Samiha @Lessons
Feature: SAMIHA_M 26-08-2026 Lessons Module

  As a Trainer
  I want to manage modules in the Lessons section
  So that I can organize the learning content of my course


  Background: Trainer logs into the application
    Given The user launches the application
    When The user clicks the "Trainer" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"


  @Navigation
  Scenario: Verify that the trainer can navigate to the Lessons module
    When The trainer navigates to My Trainings
    And The trainer selects the course
    And The trainer clicks on the Lessons tab
    Then The Lessons section should be displayed
    And The "Learning Content" section should be displayed


  @AddModule
  Scenario: Verify that the trainer can add a new module with valid details
    When The trainer navigates to My Trainings
    And The trainer selects the course
    And The trainer clicks on the Lessons tab
    And The trainer clicks on the "Add Module" button
    And The trainer enters valid module details
    And The trainer clicks on the "Save" button
    Then The newly created module should be displayed in the Learning Content section


  @AddModule @Validation
  Scenario: Verify that the trainer cannot add a module with mandatory fields empty
    When The trainer navigates to My Trainings
    And The trainer selects the course
    And The trainer clicks on the Lessons tab
    And The trainer clicks on the "Add Module" button
    And The trainer leaves the mandatory module fields empty
    And The trainer clicks on the "Save" button
    Then The module validation message should be displayed
    And The module should not be created