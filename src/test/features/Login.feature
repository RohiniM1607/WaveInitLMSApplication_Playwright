Feature: VIGNESHWARAN 24th August 2026
  As a user, I want to login to the application, so that I can access my account and perform necessary actions.

  Background: User is on the login page
    Given The user launches the application

  Scenario: User should be able to login with valid credentials
    When The user enters valid username and password
    And The user clicks on the login button
    Then The the dashboard header should be displayed with the text "Welcome back"

  @vignesh
  Scenario Outline: Application should display proper error message on invalid login
    When The user enters the "<testcase>" username and password
    And The user clicks on the login button
    Then The application should display the "<error message>"

    Examples:
      | testcase | error message |
      | invalid  | Invalid email or password |
      | empty    | Validation message |
