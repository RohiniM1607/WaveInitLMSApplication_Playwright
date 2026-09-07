
Feature: Sowndariya_01SEP2026_My Courses (Learner)- Search and Sort Courses

  As a learner
  I want to search my courses by title and sort them
  So that I can quickly find and organize my enrolled courses


  Background: Learner logs in and opens My Courses

    Given The user launches the application
    When The user clicks the "Learner" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"
    And the learner clicks on "My Courses" in the sidebar
    Then all of the learner's courses should be visible


  @search
  Scenario Outline: Learner searches for a course

    When the learner searches for the course "<courseName>"
    Then the search result should be "<expectedResult>"

    Examples:
      | courseName           | expectedResult |
      | Core Java            | Core Java      |
      | Java Selenium        | Java Selenium  |
      | Invalid Course 99999 | No courses     |


  @sort
  Scenario: Learner sorts courses by newest

    When the learner sorts the courses by "newest"
    Then the courses should be displayed in newest order


  @sort
  Scenario: Learner sorts courses by oldest

    When the learner sorts the courses by "oldest"
    Then the courses should be displayed in oldest order


  @sort
  Scenario: Learner sorts courses by title

    When the learner sorts the courses by "title"
    Then the courses should be displayed in alphabetical order