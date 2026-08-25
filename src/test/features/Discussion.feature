@sowndariya
Feature: Sowndariya_25AUG2026_Learner Discussions - Create Posts and Verify Visibility

  As a learner
  I want to create a normal post and a question in my course
  So that each one is visible under its own tab and under All Posts

  Background:
    Given The user launches the application
    When The user clicks the "Learner" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"
    And the learner opens "My Courses"
    And the learner opens the course from test data
    And the learner clicks on the "Discussions" tab

  Scenario Outline: Learner creates a <postType> and verifies it appears in the correct tab
    When the learner selects "<postType>" from the post type dropdown
    And the learner enters the message for "<postType>" from test data
    And the learner clicks the "Post" button
    Then the posted message should be visible under the "<specificTab>" tab
    And the posted message should be visible under the "All Posts" tab

    Examples:
      | postType    | specificTab |
      | Normal Post | Discussions |
      | Question    | Q&A         |