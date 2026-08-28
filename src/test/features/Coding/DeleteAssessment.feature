@Rohini @DeleteAssessment
Feature: Rohini_28Aug2026_Adding Coding Assessment
  Background:
    Given The user launches the application
    And the user logs in with "Trainer" role
    And the trainer is in the "Manual Testing" course
    And the trainer is in the Coding module

Scenario: Delete an existing coding assessment and confirm deletion
    When the trainer clicks the Delete button for the coding assessment
      | assessmentTitle               |
      | Updated Coding Assessment     |
    And the trainer clicks the Confirm button in the confirmation dialog
    Then the coding assessment should be deleted from the assessment list
     

  Scenario: Cancel deletion of an existing coding assessment
    When the trainer clicks the Delete button for the coding assessment
      | assessmentTitle               |
      | Updated Coding Assessment     |
    And the trainer clicks the Cancel button in the confirmation dialog
    Then the coding assessment should remain in the assessment list