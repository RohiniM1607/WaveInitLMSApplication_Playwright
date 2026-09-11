@vignesh @profile 
Feature: VIGNESHWARAN_M 09-09-2026 Resume Management Feature
As a user,
I want to upload, update, view, and delete my resume from my profile,
So that I can manage my resume information.

  Background:
    Given The user launches the application
    And the user logs in with "Trainer" role
    And The user navigates to the profile page

  @ui @positive @resumemanagement
  Scenario: Upload Resume button should be displayed when no resume is available
    Given the user does not have a resume uploaded
    Then the Upload Resume button should be displayed
    And the "No resume uploaded yet." message should be displayed
    And the Delete button should not be displayed
    And the Download button should not be displayed

  @positive
  Scenario Outline: User should be able to upload a valid resume
    Given the user does not have a resume uploaded
    When the user clicks the Upload Resume button
    And the user selects a valid "<FileType>" resume file smaller than or equal to 5 MB
    Then the selected file should display a "Ready to Upload" message
    When the user clicks the Upload Resume button
    Then the resume should be uploaded successfully
    And the uploaded resume file should be displayed in the profile

    Examples:
      | FileType |
      | PDF      |
      | DOC      |

  @negative
  Scenario Outline: User should not be able to upload an unsupported resume file type
    Given the user does not have a resume uploaded
    When the user clicks the Upload Resume button
    And the user selects a "<FileType>" file
    Then the system should reject the selected file
    And the "Ready to Upload" message should not be displayed
    And the user should not be able to upload the file

    Examples:
      | FileType |
      | JPG      |
      | PNG      |
      | TXT      |
      | XLSX     |
      | EXE      |

  @boundary
  Scenario: User should be able to upload a resume with exactly 5 MB file size
    Given the user does not have a resume uploaded
    When the user clicks the Upload Resume button
    And the user selects a valid resume file with exactly 5 MB size
    Then the selected file should display a "Ready to Upload" message
    When the user clicks the Upload Resume button
    Then the resume should be uploaded successfully

  @boundary
  Scenario: User should be able to upload a resume smaller than 5 MB
    Given the user does not have a resume uploaded
    When the user clicks the Upload Resume button
    And the user selects a valid resume file smaller than 5 MB
    Then the selected file should display a "Ready to Upload" message
    When the user clicks the Upload Resume button
    Then the resume should be uploaded successfully

  @negative
  Scenario: User should not be able to upload a resume exceeding 5 MB
    Given the user does not have a resume uploaded
    When the user clicks the Upload Resume button
    And the user selects a valid resume file larger than 5 MB
    Then the system should display a file size validation message
    And the "Ready to Upload" message should not be displayed
    And the user should not be able to upload the resume

  @ui
  Scenario: Resume details and action buttons should be displayed when a resume is available
    Given the user has an uploaded resume
    Then the uploaded resume file should be displayed in the profile
    And the "Update Resume" button should be displayed
    And the Delete button should be displayed
    And the Download button should be displayed
    And the Upload Resume button should not be displayed

  @positive
  Scenario Outline: User should be able to update an existing resume
    Given the user has an uploaded resume
    When the user clicks the "Update Resume" button
    And the user selects a valid "<FileType>" resume file smaller than or equal to 5 MB
    Then the selected file should display a "Ready to Upload" message
    When the user clicks the Upload Resume button
    Then the existing resume should be replaced with the newly uploaded resume
    And the updated resume should be displayed in the profile

    Examples:
      | FileType |
      | PDF      |
      | DOC      |

  @negative
  Scenario: Existing resume should remain unchanged when an invalid file is selected during update
    Given the user has an uploaded resume
    When the user clicks the "Update Resume" button
    And the user selects an unsupported or oversized file
    Then the system should reject the selected file
    And the existing resume should remain unchanged

  @positive
  Scenario: User should be able to delete an uploaded resume after confirmation
    Given the user has an uploaded resume
    When the user clicks the Delete button
    Then a delete confirmation popup should be displayed
    When the user confirms the deletion
    Then the resume should be removed successfully
    And the Upload Resume button should be displayed
    And the "Update Resume" button should not be displayed
    And the Delete button should not be displayed
    And the Download button should not be displayed

  @negative
  Scenario: Resume should not be deleted when the user cancels the delete confirmation
    Given the user has an uploaded resume
    When the user clicks the Delete button
    Then a delete confirmation popup should be displayed
    When the user cancels the deletion
    Then the delete confirmation popup should be closed
    And the existing resume should remain available in the profile

  @positive
  Scenario: User should be able to open the resume in a new browser tab
    Given the user has an uploaded resume
    When the user clicks the Download button
    Then the resume should be opened in a new browser tab
    And the opened document should match the user's uploaded resume

  @positive
  Scenario: Uploaded resume should remain available after refreshing the page
    Given the user has successfully uploaded a resume
    When the user refreshes the profile page
    Then the uploaded resume should still be displayed
    And the "Update Resume" button should be displayed
    And the Delete button should be displayed
    And the Download button should be displayed

  @positive
  Scenario: Updated resume should remain available after refreshing the page
    Given the user has successfully updated the resume
    When the user refreshes the profile page
    Then the updated resume should still be displayed

  @positive
  Scenario: Deleted resume should remain unavailable after refreshing the page
    Given the user has deleted the resume successfully
    When the user refreshes the profile page
    Then the Upload Resume button should be displayed
    And no resume file should be displayed
