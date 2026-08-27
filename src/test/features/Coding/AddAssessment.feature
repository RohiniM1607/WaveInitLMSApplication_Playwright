@Rohini
Feature: Rohini_25Aug2026_Adding Coding Assessment
  Background:
    Given The user launches the application
    And the user logs in with "Trainer" role

  # Scenario: Add assessment using Create Assessment option
  #   Given the trainer is in the "Manual Testing" course
  #   And the trainer is in the Coding module
  #   When the trainer clicks on the Create Assessment button
  #   Then a new coding assessment should be added to the assessment list

  Scenario: Create assessment using Generate with AI option
    Given the trainer is in the "Manual Testing" course
    And the trainer is in the Coding module
    When the trainer clicks on the Generate with AI button
    And the trainer enters the assessment details
    And the trainer clicks on the Generate Assessment button
    Then a new coding assessment should be added to the assessment list