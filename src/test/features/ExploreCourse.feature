@sowndariya
Feature: Learner Explore Courses - Join, Already Joined and Full status

  As a learner
  I want to open Explore Courses from the dashboard
  So that I can see which courses I can join, which I already joined, and which are full

  Background:
    Given The user launches the application
    When The user clicks the "Learner" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"
    And the learner clicks on "Explore Courses" from the dashboard header
    Then the learner should be on the "Available" courses tab

  @exploreCourses @statusCheck
  Scenario: Learner checks the status shown on every course card
    When the learner checks the status of every course card on the "Available" tab
    Then every course card should show either "Join", "Already Joined" or "Full" as its status

  @exploreCourses @openNotJoined
  Scenario: Learner opens a course that is not joined yet and sees only the Register option
    When the learner opens a course card that shows the "Join" status
    Then the course details should show the "Register" button only
    And the "Already Joined" status should not be visible on the course details

  @exploreCourses @joinCourse
  Scenario: Learner registers for a course and it now shows Already Joined
    When the learner opens a course card that shows the "Join" status
    And the learner clicks the "Register" button on the course details
    Then the course details should show the "Already Joined" status only
    And the "Register" button should not be visible on the course details

  @exploreCourses @openFull
  Scenario: Learner opens a course that is full and cannot register
    When the learner opens a course card that shows the "Full" status
    Then the course details should show the "Full" status
    And the "Register" button should not be visible on the course details

  @exploreCourses @openAlreadyJoined
  Scenario: Learner opens a course already joined and is not offered to register again
    When the learner opens a course card that shows the "Already Joined" status
    Then the course details should show the "Already Joined" status
    And the "Register" button should not be visible on the course details
