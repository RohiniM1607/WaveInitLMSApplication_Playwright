@Rohini @EditAssessment
Feature: Rohini_26Aug2026_Editing Coding Assessment

  Background:
    Given The user launches the application
    And the user logs in with "Trainer" role
    Given the trainer is in the "Manual Testing" course
    And the trainer is in the Coding module

  @Title
  Scenario: Edit an existing coding assessment title
    When the trainer clicks the Edit button for an existing coding assessment
    And the trainer clicks the Edit button in the assessment details
    And the trainer updates the assessment title
    And the trainer clicks the Save button
    Then the updated assessment title should be displayed in the assessment list

  @Multiplefield
  Scenario: Edit multiple fields of a coding assessment
    When the trainer clicks the Edit button for an existing coding assessment
    And the trainer clicks the Edit button in the assessment details
    And the trainer updates the multiple assessment details
    And the trainer clicks the Save button
    Then the updated assessment details should be displayed correctly

  @NoChanges
  Scenario: Save an assessment without making changes
    When the trainer clicks the Edit button for an existing coding assessment
    And the trainer clicks the Edit button in the assessment details
    And the trainer clicks the Save button
    Then the assessment should remain unchanged

  @MandatoryTitle @Bug
  Scenario: Validate mandatory title while editing assessment
    When the trainer clicks the Edit button for an existing coding assessment
    And the trainer clicks the Edit button in the assessment details
    And the trainer clears the assessment title
    And the trainer clicks the Save button
    Then the assessment title validation message should be displayed
  
  @CancelEditing
  Scenario: Cancel editing an assessment
    When the trainer clicks the Edit button for an existing coding assessment
    And the trainer clicks the Edit button in the assessment details
    And the trainer updates the assessment title
    And the trainer clicks the Cancel button
    Then the original assessment title should remain unchanged