@deletequiz
Feature: BALAMURUGAN 26th August 2026 - Delete Quiz Manually

    As a trainer,
    I want to delete a quiz I created,
    so that I can remove quizzes that are no longer needed.

    Background: Trainer navigates to the AI Quiz section of a course

        Given The user launches the application
        When The user clicks the "Trainer" login button
        And The user enters valid username and password
        And The user clicks the login button
        Then The dashboard header should be displayed with the text "Welcome back"
        When The trainer clicks on the "My Trainings" menu
        And The trainer selects the course from the list
        And The trainer clicks on the "AI Quiz" tab

    Scenario Outline: Trainer should be able to delete a quiz using different datasets

        When The trainer clicks on the "Create Manually" button
        And The trainer creates a quiz using the "<dataset>" dataset
        And The trainer clicks on the "Save as Draft" button
        Then The quiz should be listed with the correct number of questions and status "DRAFT"
        When The trainer deletes the quiz
        Then The quiz should not be listed anymore

        Examples:
            | dataset   |
            | operators |
            | variables |
            | loops     |
            | arrays    |