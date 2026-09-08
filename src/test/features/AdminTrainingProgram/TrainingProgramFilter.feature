@sowndariya
Feature: Admin_03SEP2026_Training Program Status Filter

  As an admin
  I want to filter training programs by status on the Training Program page
  So that I can view Active, Upcoming, Completed, or All training programs correctly

  Background:
    Given The user launches the application
    When The user clicks the "Admin" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"
    And the admin navigates to the Training Program page


  @valid
  Scenario Outline: Admin filters training programs by status
    When the admin selects the "<filterStatus>" status filter
    Then every listed training program should have the status "<expectedStatus>"

    Examples:
      | filterStatus | expectedStatus |
      | Active       | Active         |
      | Upcoming     | Upcoming       |
      | Completed    | Completed      |


  @valid @all
  Scenario: Admin filters training programs by All status
    When the admin selects the "All" status filter
    Then the training program list should contain all available statuses


  @invalid
  Scenario Outline: Admin status filter does not display excluded statuses
    When the admin selects the "<filterStatus>" status filter
    Then the training program list should not include the status "<excludedStatus1>"
    And the training program list should not include the status "<excludedStatus2>"

    Examples:
      | filterStatus | excludedStatus1 | excludedStatus2 |
      | Active       | Upcoming        | Completed       |
      | Upcoming     | Active          | Completed       |
      | Completed    | Active          | Upcoming        |