@sowndariya
Feature: Sowndariya_28AUG2026_Learner Explore Courses - Search, Enrollment and Course Filters

  As a learner
  I want to explore and search courses
  So that I can verify course enrollment status and course filters

  Background:
    Given The user launches the application
    When The user clicks the "Learner" login button
    And The user enters valid username and password
    And The user clicks the login button
    Then The dashboard header should be displayed with the text "Welcome back"
    And the learner clicks on "Explore Courses" from the dashboard header

  @exploreCourses @searchAndJoin
  Scenario: Learner searches a course and joins it when Join Training is available
    When the learner enters the course name from test data in the search field
    Then the searched course should be displayed
    And the learner should see the correct enrollment status for the searched course
    When the learner joins the searched course if Join Training is available
    Then the searched course should show the correct final enrollment status

  @exploreCourses @joinedTab
  Scenario: Learner verifies the Joined tab contains only enrolled courses
    When the learner clicks on the Explore Courses "Joined" tab
    Then only enrolled courses should be displayed
    And every course should show "Already enrolled" status

  @exploreCourses @openTab
  Scenario: Learner verifies the Open tab contains only courses available for joining
    When the learner clicks on the Explore Courses "Open" tab
    Then only courses available for joining should be displayed
    And every course should show "Join Training"
    And Already enrolled courses should not be displayed
    And Training is full courses should not be displayed

  @exploreCourses @allTab
  Scenario: Learner verifies all courses and their enrollment statuses
    When the learner clicks on the Explore Courses "All" tab
    Then all courses should be displayed
    And every course should show Join Training, Already enrolled or Training is full status
