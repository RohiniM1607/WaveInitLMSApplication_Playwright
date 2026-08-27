@sowndariya
Feature: Sowndariya_25AUG2026_Learner Discussions - Create Posts and Verify Visibility

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

  @discussion @allPosts
  Scenario: Learner creates a post for every post type from test data and verifies all appear under All Posts
    When the learner creates a post for each post type from test data
    Then all the posted messages should be visible under the "All Posts" tab

  @discussion @validation
  Scenario Outline: Learner submits an empty <postType> and sees a required field validation error
    When the learner selects "<postType>" from the post type dropdown
    And the learner clicks the "Post" button without entering a message
    Then a required field validation error should be displayed

    Examples:
      | postType    |
      | Normal Post |
      | Question    |

  @discussion @specificTab
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

  @discussion @addReply
  Scenario Outline: Learner replies to a <postType> post and verifies the reply appears below the post
    When the learner selects "<postType>" from the post type dropdown
    And the learner enters the message for "<postType>" from test data
    And the learner clicks the "Post" button
    Then the posted message should be visible under the "<specificTab>" tab
    When the learner clicks the "Reply" link on the posted message
    And the learner enters the "default" reply message for "<postType>" from test data
    And the learner clicks the "Post Reply" button
    Then the "default" reply message should be visible below the posted message

    Examples:
      | postType    | specificTab |
      | Normal Post | Discussions |
      | Question    | Q&A         |

  @discussion @deleteReply
  Scenario: Learner deletes one of two replies on a post and verifies only the deleted reply is removed
    When the learner selects "Normal Post" from the post type dropdown
    And the learner enters the message for "Normal Post" from test data
    And the learner clicks the "Post" button
    Then the posted message should be visible under the "Discussions" tab
    When the learner clicks the "Reply" link on the posted message
    And the learner enters the "first" reply message for "Normal Post" from test data
    And the learner clicks the "Post Reply" button
    Then the "first" reply message should be visible below the posted message
    When the learner clicks the "Reply" link on the posted message
    And the learner enters the "second" reply message for "Normal Post" from test data
    And the learner clicks the "Post Reply" button
    Then the "second" reply message should be visible below the posted message
    When the learner clicks the delete icon on the "second" reply message
    Then a delete confirmation popup should be displayed
    When the learner confirms the delete action
    Then a post deleted success message should be displayed
    And the "second" reply message should not be visible below the posted message
    And the "first" reply message should be visible below the posted message

  @discussion @deletePost
  Scenario Outline: Learner deletes a <postType> post and verifies the confirmation and success message
    When the learner selects "<postType>" from the post type dropdown
    And the learner enters the message for "<postType>" from test data
    And the learner clicks the "Post" button
    Then the posted message should be visible under the "<specificTab>" tab
    When the learner clicks the delete icon on the posted message
    Then a delete confirmation popup should be displayed
    When the learner confirms the delete action
    Then a post deleted success message should be displayed
    And the posted message should not be visible under the "<specificTab>" tab

    Examples:
      | postType    | specificTab |
      | Normal Post | Discussions |
      | Question    | Q&A         |
