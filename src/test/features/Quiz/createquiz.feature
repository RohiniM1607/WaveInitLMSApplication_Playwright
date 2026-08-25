@quiz
Feature: BALAMURUGAN 25th August 2026 - Create Quiz Manually

  As a trainer,
  I want to create a quiz manually for my course,
  so that I can assess my students' learning progress.

  Background: Trainer navigates to the AI Quiz section of a course
    Given The user launches the application
    When The user clicks the "Trainer" login button
    And The user enters valid username and password
    And The user clicks on the login button
    Then The the dashboard header should be displayed with the text "Welcome back"
    When The trainer clicks on the "My Trainings" menu
    And The trainer selects the course from the list
    And The trainer clicks on the "AI Quiz" tab

  Scenario: Trainer should be able to create a quiz manually
    When The trainer clicks on the "Create Manually" button
    And The trainer creates a quiz using the "operators" dataset
    And The trainer clicks on the "Save as Draft" button
    Then The quiz should be listed with the correct number of questions and status "DRAFT"