@new
Feature: accurate reporting
  I want the application to check the data before it can be added to datastore

   Background:
    Given I have submitted new measurements as follows:
      | timestamp                  | temperature | dewPoint |
      | "2015-09-01T16:00:00.000Z" | 27.1        | 16.9     |
      | "2015-09-01T16:10:00.000Z" | 27.3        |          |
      | "2015-09-01T16:20:00.000Z" | 27.5        | 17.1     |
      | "2015-09-01T16:30:00.000Z" | 27.4        | 17.3     |
      | "2015-09-01T16:40:00.000Z" | 27.2        |          |
      | "2015-09-01T17:00:00.000Z" | 28.1        | 18.3     |

  Scenario: Add measurements checks for timestamp
    When: I add measurements to datastore
    Then: it checks data for a timestamp

  Scenario: Measurement values are float or ''
    When: I add measurements to datastore
    Then: it validates that data is in float format
    And: it validates that empty data w/ key is ''