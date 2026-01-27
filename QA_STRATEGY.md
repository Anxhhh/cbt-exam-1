# StatePrep 'Anti-Gravity' QA Strategy Document

**Role:** Senior Lead SDET
**Project:** StatePrep (React CBT Application)
**Objective:** Ensure application stability, responsiveness, and data integrity under stress conditions across Desktop and Mobile platforms.

---

## 1. Layout Stress Tests (Visual Regression & Overlap)

**Objective:** Verify that the 3D background (Three.js) and other visual effects do not interfere with core usability on constrained viewports.

### Scenario 1.1: Mobile Viewport Z-Index Collision
*   **Target:** Mobile (iOS Safari / Android Chrome) - Portrait Mode
*   **Priority:** Critical
*   **Gherkin:**
    ```gherkin
    Given I am taking the exam on a mobile device (viewport width < 400px)
    And the Three.js animated background is active
    When I scroll to the bottom of a long question text
    Then the "Next" and "Previous" navigation buttons must be clickable
    And the 3D canvas layer must have a z-index lower than the text container
    And no 3D elements should obscure the question options or the submit button
    ```

### Scenario 1.2: Dynamic Font Scaling & Overflow
*   **Target:** All Devices
*   **Priority:** High
*   **Gherkin:**
    ```gherkin
    Given I have a question with a very long paragraph (500+ words)
    And I am on a device with increased system font size (Accessibility enabled)
    When the question loads
    Then the text container should expand vertically with a scrollbar
    And the text must not overflow outside the "glass" card container
    And the "Question Palette" sidebar/drawer must remain accessible without resizing the main content destructively
    ```

---

## 2. State Persistence Scenarios (Resilience)

**Objective:** Guarantee that the exam state (Timer, Answers, Marked for Review) survives process interruptions.

### Scenario 2.1: Mobile Backgrounding / Tab Switching
*   **Target:** iOS/Android
*   **Priority:** Critical
*   **Gherkin:**
    ```gherkin
    Given I am 15 minutes into the exam
    And I have answered 10 questions
    When I minimize the browser app to answer a phone call or switch tabs
    And I return to the StatePrep tab after 2 minutes
    Then the exam timer should reflect the correct elapsed real-time (not paused)
    And my selected answers for the 10 questions must remain selected
    And the "Resume" state should be triggered automatically without reloading the start screen
    ```

### Scenario 2.2: Browser Force Refresh
*   **Target:** Desktop/Mobile
*   **Priority:** High
*   **Gherkin:**
    ```gherkin
    Given I am in the middle of a session
    When I accidentally press "Command + R" or reload the page
    Then the application should check LocalStorage for an active session key
    And I should be prompted to "Resume Previous Session" or redirected immediately to the last active question
    And the timer must continue from where it left off (minus the time taken to reload)
    ```

---

## 3. Performance Benchmarks ('Anti-Gravity' Smoothness)

**Objective:** Ensure high frame rates for UI interactions even when WebGL is rendering.

### Benchmark Criteria
*   **Main Thread Blocking:** < 50ms for any interaction.
*   **FPS Target:** Consistent 60fps on Desktop; Min 30fps on low-end Mobile.

### Scenario 3.1: Rapid Fire Question Switching
*   **Target:** Stress Test via Script
*   **Priority:** Medium
*   **Gherkin:**
    ```gherkin
    Given the exam is loaded with 100 questions
    When I click the "Next" button repeatedly (5 times per second)
    Then the transition animation between questions should remain fluid
    And the UI thread should not freeze
    And the Three.js background animation loop should not drop below 30fps
    And the answer validation logic (state update) must complete for every click
    ```

---

## 4. Edge Case 'Chaos' Tests

**Objective:** Verify system behavior under failure conditions and invalid data states.

### Scenario 4.1: Network Cutoff at Submission
*   **Target:** Network Throttling / Offline Mode
*   **Priority:** Critical
*   **Gherkin:**
    ```gherkin
    Given I have completed the exam
    And I disconnect my internet connection (simulate tunnel/elevator)
    When I click "Submit Final Exam"
    Then the app should detect the offline state
    And it should cache the result locally
    And display a "Connection Lost. Result saved on device. Please reconnect to finalize." toast message
    And it should NOT crash or lose the calculated score
    ```

### Scenario 4.2: The 'Null' Z-Score Anomaly
*   **Target:** Unit Test / Logic Validation
*   **Priority:** High
*   **Gherkin:**
    ```gherkin
    Given the Z-test evaluation logic runs on submission
    And the user has answered 0 questions (Empty dataset)
    Or the user has answered all questions incorrectly (Zero variance potential)
    When the score is calculated
    Then the application must handle division-by-zero errors gracefully
    And the 'Z-Score' field in the result card should display "N/A" or "0.00" instead of "NaN" or crashing the render loop
    And the "Performance Graph" should render a neutral flat line
    ```

---

## 5. Automated Test Implementation Plan

1.  **E2E Framework:** Playwright (supports mobile viewport emulation and network interception).
2.  **Visual Testing:** Percy or Argos CI (to catch Z-index and layout regressions).
3.  **Unit Testing:** Vitest (for Z-score calculation logic and Reducer state management).
