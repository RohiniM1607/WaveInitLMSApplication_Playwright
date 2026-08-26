@sowndariya
Feature: Sowndariya_25AUG2026_Learner Discussions - Create Posts and Verify Visibility _updated_26AUG2026

  As a learner
  I want to create a normal post and a question in my course
  So that empty submissions are validated, and valid posts are visible under All Posts and under their own tab

  Background:
    Given The user launches the application
    When The user clicks the "Learner" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"
    And the learner opens "My Courses"
    And the learner opens the course from test data
    And the learner clicks on the "Discussions" tab

  Scenario: Learner creates a post for every post type from test data and verifies all appear under All Posts
    When the learner creates a post for each post type from test data
    Then all the posted messages should be visible under the "All Posts" tab


  Scenario Outline: Learner submits an empty <postType> and sees a required field validation error
    When the learner selects "<postType>" from the post type dropdown
    And the learner clicks the "Post" button without entering a message
    Then a required field validation error should be displayed

    Examples:
      | postType    |
      | Normal Post |
      | Question    |


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
