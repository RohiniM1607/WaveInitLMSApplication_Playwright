@sowndariya @addTraining
Feature: Admin_07SEP2026_Add Training Program

  As an admin
  I want to create a new training session with title, description, trainer, dates and capacity
  So that the training program list reflects exactly what I entered

  Background:
    Given The user launches the application
    When The user clicks the "Admin" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"
    And the admin navigates to the Training Program page

  @valid
  Scenario Outline: Admin creates a training session with valid data
    When the admin creates a training session using test data "<testCaseId>"
    Then the training session should be created successfully

    Examples:
      | testCaseId |
      | TC01       |
      | TC03       |
      | TC04       |

  @invalid
  Scenario Outline: Admin cannot create a training session with invalid data
    When the admin attempts to create a training session using test data "<testCaseId>"
    Then the training session creation should be rejected

    Examples:
      | testCaseId |
      | TC02       |

  @invalid @validation
  Scenario: Admin cannot create a training session without selecting a trainer
    When the admin attempts to create a training session without selecting a trainer
    Then the trainer required error message should be displayed

  @invalid @validation
  Scenario: Admin cannot create a training session without a title
    When the admin attempts to create a training session without a title
    Then the browser should show a required-field validation message for the title field

  @invalid @validation
  Scenario: Admin cannot create a training session without a start date
    When the admin attempts to create a training session without a start date
    Then the browser should show a required-field validation message for the start date field