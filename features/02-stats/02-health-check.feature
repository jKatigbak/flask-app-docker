@new
Feature: health checking for application
  I want to be able to know if my docker container is healthy

  Scenario Container is fault-tolerant
    When The image is built
    Then Perform health-checks


