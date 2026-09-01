@vignesh @profile @profilepicture
Feature: VIGNESHWARAN_M 01-09-2026 Profile Picture Upload Feature

    As a user,
    I want to upload a profile picture in my profile,
    So that I can personalize my account.
    
    Background: User is on the profile picture upload page
        Given The user launches the application
        And the user logs in with "Trainer" role
        And The user navigates to the social link management page
    
    Scenario: User should be able to upload a valid profile picture
        When The user clicks on the camera icon in the profile picture section
        And The user clicks on the Choose Image button
        And The user selects a valid image file from the local system
        And The user clicks the Save Photo button
        Then The uploaded profile picture should be displayed in the user's profile
    
    @bug
    Scenario: User should not be able to upload an invalid file type as profile picture
        When The user clicks on the camera icon in the profile picture section
        And The user clicks on the Choose Image button
        And The user selects an invalid file type from the local system
        And The user clicks the Save Photo button
        Then An error message should be displayed indicating "Invalid file type. Please upload a JPEG or PNG image."
    
    @bug
    Scenario: User should not be able to upload a profile picture exceeding size limit
        When The user clicks on the camera icon in the profile picture section
        And The user clicks on the Choose Image button
        And The user selects an image file exceeding the size limit from the local system
        And The user clicks the Save Photo button
        Then An error message should be displayed indicating "File size exceeds limit. Please upload an image smaller than 5MB."

    
    Scenario: User should be able to remove the profile picture
        When The user clicks on the camera icon in the profile picture section
        And The user clicks on the Choose Image button
        And The user selects a valid image file from the local system
        And The user clicks the Save Photo button
        And The user clicks on the camera icon in the profile picture section
        And The user clicks on the Remove Photo button
        Then The first two letters of the username should be displayed in the user's profile