Feature: accurate reporting
  I want the application to check the data before it can be added to datastore

  Scenario: Add measurements checks for timestamp
    When I add measurements to datastore
    Then it checks data for a timestamp

  Scenario: Measurement values are float or ''
    When I add measurements to datastore
    Then it validates that data is in float format
    And it validates that empty data w/ key is ''