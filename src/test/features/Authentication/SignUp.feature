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

  Scenario: Registration should display validation message for short password
    When The user enters valid registration details except password
      | FullName | John Doe  |
      | EmailAddress | john.doe |
      | PhoneNumber | 9876543210 |
    And The user enters "12345" in the password field
    And The user enters "12345" in the confirm password field
    And The user accepts the Terms of Service
    And The user clicks the Create Account button
    Then The registration error message should be displayed as "Password must be at least 6 characters"

  Scenario: Registration should display validation message when passwords do not match
    When The user enters valid registration details except password
      | FullName | John Doe  |
      | EmailAddress | john.doe |
      | PhoneNumber | 9876543210 |
    And The user enters "Password@123" in the password field
    And The user enters "Password@456" in the confirm password field
    And The user accepts the Terms of Service
    And The user clicks the Create Account button
    Then The registration error message should be displayed as "Passwords do not match"

  Scenario: Registration should require Terms of Service agreement
    When The user enters valid details in the registration form
      | FullName | John Doe  |
      | EmailAddress | john.doe |
      | PhoneNumber | 9876543210 |
      | Password | Password@123 |
      | ConfirmPassword | Password@123 |
    And The user clicks the Create Account button
    Then The registration error message should be displayed as "You must agree to the terms"

  Scenario: Registration should reject an invalid email format
    When The user enters "invalid-email" in the email field
    And The user enters valid values in all other registration fields
    And The user accepts the Terms of Service
    And The user clicks the Create Account button
    Then The email field should display a validation message

  Scenario Outline: Password strength should be displayed based on password complexity
    When The user enters "<password>" in the password field
    Then The password strength should be displayed as "<strength>"

    Examples:
      | password     | strength |
      | 12345        | Weak     |
      | 123456       | Fair     |
      | password123  | Good     |
      | Password@123 | Strong   |

  Scenario: User should be able to navigate to login page from registration page
    When The user clicks the Sign in link
    Then The login page should be displayed
