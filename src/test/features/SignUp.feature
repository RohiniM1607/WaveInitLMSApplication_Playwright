@vignesh @signup
Feature: VIGNESHWARAN_M 24-08-2026 User Registration Feature
  As a new user,
  I want to register for an account,
  So that I can access the application.

  Background: User is on the registration page
    Given The user launches the application
    And The user navigates to the registration page

  Scenario: User should be able to register with valid details
    When The user enters valid details in the registration form
      | FullName | John Doe  |
      | EmailAddress | john.doe |
      | PhoneNumber | 9876543210 |
      | Password | Password@123 |
      | ConfirmPassword | Password@123 |
    And The user accepts the Terms of Service
    And The user clicks the Create Account button
    And The user should be redirected to the login page

  Scenario Outline: Registration should display validation message when a mandatory field is empty
    When The user leaves the "<field>" field empty
    And The user fills the remaining registration fields with valid details
      | FullName | John Doe  |
      | EmailAddress | john.doe |
      | PhoneNumber | 9876543210 |
      | Password | Password@123 |
      | ConfirmPassword | Password@123 |
    And The user accepts the Terms of Service
    And The user clicks the Create Account button
    Then The registration error message should be displayed as "<error message>"

    Examples:
      | field         | error message            |
      | FullName     | Full name is required    |
      | EmailAddress | Email is required        |
      | PhoneNumber  | Phone number is required |
      | Password      | Password is required     |

  