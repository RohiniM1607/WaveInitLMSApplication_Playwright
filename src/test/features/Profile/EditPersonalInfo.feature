@vignesh @profile @editpersonalinfo
Feature: VIGNESHWARAN_M 04-09-2026 Edit Personal Information Feature
    As a user,
    I want to edit my personal information in my profile,
    So that I can keep my account information up to date.

  Background: User is on the edit personal information page
    Given The user launches the application
    And the user logs in with "Trainer" role
    And The user navigates to the profile page
    And The user clicks on the Edit button in the personal information section

  
  Scenario: User successfully updates all editable personal information
    When the user updates the form with valid details
      | Full Name    | Vigneshwaran M              |
      | Phone Number | 9876543210                  |
      | Department   | Software Testing            |
      | Designation  | SDET                        |
      | About Me     | Experienced software tester |
    And the user clicks on the Save Changes button
    Then the updated information should be displayed on the profile page
      | Full Name    | Vigneshwaran M              |
      | Phone Number | 9876543210                  |
      | Department   | Software Testing            |
      | Designation  | SDET                        |
      | About Me     | Experienced software tester |

  Scenario: User successfully updates only the Full Name
    When the user updates the Full Name with "Vigneshwaran M"
    And the user clicks on the Save Changes button
    Then the Full Name should be updated successfully as "Vigneshwaran M"

  Scenario Outline: Verify the disabled fields cannot be modified
    Then the "<field>" field should be read-only
    And the user should not be able to modify the "<field>"

    Examples:
      | field          |
      | Email          |
      | Participation ID |

  Scenario: User attempts to save personal information without entering Full Name
    When the user clears the Full Name field
    And the user clicks on the Save Changes button
    Then a validation message should be displayed for the Full Name field

  Scenario: User attempts to enter only whitespace in the Full Name field
    When the user enters only whitespace in the Full Name field
    And the user clicks on the Save Changes button
    Then a validation message should be displayed for the Full Name field

  Scenario: User cancels the personal information update
    When the user updates the form with valid details
      | Full Name    | Vigneshwaran M              |
      | Phone Number | 9876543210                  |
      | Department   | Software Testing            |
      | Designation  | SDET                        |
      | About Me     | Experienced software tester |
    And the user clicks on the Cancel button
    And the changes should not be saved in the personal information section

  Scenario Outline: User enters an invalid phone number
    When the user enters "<phoneNumber>" in the Phone Number field
    And the user clicks on the Save Changes button
    Then an appropriate validation message should be displayed

    Examples:
      | phoneNumber     |
      | abcdefghij      |
      | 123             |
      | 123456789012345 |
      | @#$%^&*         |

  Scenario Outline: User enters invalid characters in the Full Name field
    When the user updates the Full Name with "<fullName>"
    And the user clicks on the Save Changes button
    Then an appropriate validation message should be displayed

    Examples:
      | fullName |
      | 123456   |
      | @#$%^    |

  Scenario: Verify existing personal information is displayed in the edit form
    When the user updates the form with valid details
      | Full Name    | Vigneshwaran M              |
      | Phone Number | 9876543210                  |
      | Department   | Software Testing            |
      | Designation  | SDET                        |
      | About Me     | Experienced software tester |
    And the user clicks on the Save Changes button
    And The user clicks on the Edit button in the personal information section
    Then the existing form details should be displayed in the fields
      | Full Name    | Vigneshwaran M              |
      | Phone Number | 9876543210                  |
      | Department   | Software Testing            |
      | Designation  | SDET                        |
