@sowndariya @editDeleteTraining
Feature: Admin Training Program Edit and Delete

  As an admin
  I want to edit and delete training programs
  So that the Training Programs list remains accurate

  Background:
    Given The user launches the application
    When The user clicks the "Admin" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"
    And the admin navigates to the Training Program page

  @edit
  Scenario: Admin verifies and edits an existing training program
    When the admin opens the existing training program for editing
    Then the existing training program values should be loaded
    When the admin updates the supported training program fields
    And the admin saves the edited training program
    Then the edit should show the known training update server error

  @edit @validation
  Scenario: Admin cannot save an edit without a title
    When the admin opens the existing training program for editing
    And the admin clears the training program title and saves
    Then the edit title should have a required field validation message

  @delete
  Scenario: Admin cancels deletion of an existing training program
    When the admin opens the existing training program deletion confirmation
    Then the delete confirmation should identify the selected training program
    When the admin cancels the training program deletion
    Then the selected training program should remain displayed

  @delete
  Scenario: Admin confirms deletion of an existing training program
    When the admin opens the existing training program deletion confirmation
    Then the delete confirmation should identify the selected training program
    When the admin confirms the training program deletion
    Then the deleted training program should no longer be displayed