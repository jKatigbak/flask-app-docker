@new
Feature: clean start state
  I want the application to start with an empty datastore

  Scenario: application start
    When: the application start
    Then: the app registers an exit handler

  Scenario: application data must remain in memory
    When: the application quits/terminated
    Then: the app is given a clean datastore
    And: the app moves datastore and timestamps it (redundancy)

