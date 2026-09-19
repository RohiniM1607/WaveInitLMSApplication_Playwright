@quiz @searchquestion
Feature: BALAMURUGAN 1st September 2026 - Search Question Bank

  As a trainer,
  I want to search existing questions by their question text,
  so that I can find and reuse questions from previous quizzes.

  Background: Trainer logs in

    Given The user launches the application
    When The user clicks the "Trainer" login button
    And The user enters valid username and password for "trainer1"
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"

  Scenario Outline: Trainer searches the question bank using the question text

    When The trainer clicks on the "My Trainings" menu
    And The trainer selects the course "<courseName>" from the list
    And The trainer clicks on the "AI Quiz" tab
    And The trainer opens the question bank
    And The trainer searches the question bank for "<questionText>"
    Then The search results should contain "<questionText>" from "<sourceQuiz>"

    Examples:
      | courseName      | questionText                                             | sourceQuiz |
      | Web development | Which property gives the number of elements in an array? | arrays     |
      | Web development | Which loop executes its body at least once?              | loops      |


  Scenario Outline: Trainer searches the question bank for a question that does not exist

    When The trainer clicks on the "My Trainings" menu
    And The trainer selects the course "Web development" from the list
    And The trainer clicks on the "AI Quiz" tab
    And The trainer opens the question bank
    And The trainer searches the question bank for "<questionText>"
    Then The search results should show no questions found message

    Examples:
      | questionText                                              |
      | Can Jenkins build a project without Maven?                |
      | What is the difference between a dependency and a plugin? |