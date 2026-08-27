@vignesh @sociallink @profile
Feature: VIGNESHWARAN_M 27-08-2026 Social Link Feature
    As a user,
    I want to manage my social links in my profile,
    So that I can connect my social media accounts to my profile.

  Background: User is on the social link management page
    Given The user launches the application
    And the user logs in with "Trainer" role
    And The user navigates to the social link management page

  Scenario: User should be able to edit the social media link
    When The user clicks on the Edit button in the social link section
    And The user enters valid details in the social link form
      | Linkedin  | www.linkedin.com/in/johndoe |
      | Github    | github.com/johndoe          |
      | Twitter   | twitter.com/johndoe         |
      | Instagram | www.instagram.com/johndoe   |
      | Portfolio | www.johndoe.com             |
      | Website   | www.johndoe.com             |
    And The user clicks the Save button
    Then The edited social link should be updated in the user's profile
      | Linkedin  | www.linkedin.com/in/johndoe |
      | Github    | github.com/johndoe          |
      | Twitter   | twitter.com/johndoe         |
      | Instagram | www.instagram.com/johndoe   |
      | Portfolio | www.johndoe.com             |
      | Website   | www.johndoe.com             |

  Scenario Outline: User should be redirected to the social link management page after saving the social link
    When The user clicks on the Edit button in the social link section
    And The user enters valid details in the social link form
      | Linkedin  | www.linkedin.com/in/johndoe |
      | Github    | www.github.com/johndoe      |
      | Twitter   | www.twitter.com/johndoe     |
      | Instagram | www.instagram.com/johndoe   |
      | Portfolio | www.johndoe.com             |
      | Website   | www.johndoe.com             |
    And The user clicks the Save button
    And The user clicks the "<Website>" social media link in the profile section
    Then The user should be redirected to the "<Website>" page

    Examples:
      | Website         |
      | Linkedin        |
      | Github          |
      | Twitter         |
      | Instagram       |
      | www.johndoe.com |
      | www.johndoe.com |

  Scenario: User should not be able to add the social media link with invalid URL
    When The user clicks on the Edit button in the social link section
    And The user enters valid details in the social link form
      | Linkedin  | INVALID_URL |
      | Github    | INVALID_URL |
      | Twitter   | INVALID_URL |
      | Instagram | INVALID_URL |
      | Portfolio | INVALID_URL |
      | Website   | INVALID_URL |
    And The user clicks the Save button
    Then The edited social link should be updated in the user's profile
