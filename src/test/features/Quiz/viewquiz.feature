@quiz @viewquiz @bala

Feature: BALAMURUGAN 25th August 2026 - View Quiz Details

  As a trainer,
  I want to view the details of an existing quiz,
  so that I can verify its configuration before publishing it to students.

  Background: Trainer navigates to the AI Quiz section of a course

    Given The user launches the application
    When The user clicks the "Trainer" login button
    And The user enters valid username and password for "trainer1"
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"
    When The trainer clicks on the "My Trainings" menu
    And The trainer selects the course from the list
    And The trainer clicks on the "AI Quiz" tab

  Scenario Outline: Trainer should be able to view details of an existing quiz

    When The trainer clicks the "View Quiz Details" icon for the quiz "<quizTitle>"
    Then The quiz details modal should show the title "<quizTitle>"
    And The quiz details modal should show "<questionCount>" questions and status "DRAFT"
    And The quiz details modal should show "<duration>" as the duration
    And The quiz details modal should show "<passingMarks>" as the passing marks
    And The trainer closes the quiz details modal

    Examples:
      | quizTitle | questionCount | duration   | passingMarks |
      | operators | 2             | 30 minutes | 50%          |
      | variables | 2             | 30 minutes | 50%          |
      | loops     | 2             | 30 minutes | 50%          |
      | arrays    | 2             | 30 minutes | 50%          |