Feature: Cucumber Example

Background:
    Given User navigates to Gmail website

Scenario: Gmail login and verify first email subject line
    When User enters the email as "AutomationTest.1123"
    And User enters the password as "AutomationTest@1"
    Then Verify email with subject line "Automation, finish setting up your new Google Account" is present
