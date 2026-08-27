@vignesh @login
Feature: VIGNESHWARAN_M 24-08-2026 Login Feature
  As a user,
  I want to log in to the application,
  So that I can access my account and perform necessary actions.

  Background: User is on the login page
    Given The user launches the application

  Scenario Outline: User should be able to log in with valid credentials
    When The user clicks the "<role>" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"

    Examples:
      | role    |
      | Admin   |
      | Trainer |
      | Learner |

  Scenario Outline: Application should display an error message for invalid credentials
    When The user clicks the "<role>" login button
    And The user enters invalid username and password
    And The user clicks the login button
    Then The application should display the error message "Invalid email or password"

    Examples:
      | role    |
      | Admin   |
      | Trainer |
      | Learner |

  Scenario Outline: Application should validate mandatory login fields
    When The user clicks the "<role>" login button
    And The user leaves the username and password fields empty
    And The user clicks the login button
    Then The username and password fields should display validation errors

    Examples:
      | role    |
      | Admin   |
      | Trainer |
      | Learner |
