# LMS Admin Training Programs Test Plan

## Application Overview

Comprehensive UI test plan for the WAVE INIT LMS Admin Training Programs workflow, based on live exploration of https://www.waveinitlms.online/login in Chromium. Fresh-state assumption: each scenario starts from a new browser context at the login page, with no prior session or unsaved changes. Observed QA credentials: Admin role, username/email admin@test.com, password admin123. Cookie consent may appear and should be dismissed with Essential Only. Observed seeded data includes 83 total training records, 10 shown per page, and upcoming zero-enrollment programs such as Node.js Fundamentals 1789040988125 (trainer01, 27 Jan 2027 to 31 Jan 2027, capacity 25) and Node.js Fundamentals 1789041007595 (trainer01, 30 Apr 2027 to 05 May 2027, capacity 25). A distinct existing A program (trainer01, 18 Jul 2027 to 22 Jul 2027, capacity 10, enrolled 0) was deleted during exploration; scenarios must select records by complete row values and use a restored/seeded equivalent in execution. Observed BUG-TP-002: editing title and description and selecting Save Changes leaves the edit panel open, keeps the entered values, and shows the notification Server error updating training; the list remains unchanged. The trainer assignment region was present but contained no trainer options during exploration. Do not modify existing Cucumber automation code.

## Test Scenarios

### 1. Admin Authentication And Training Program Navigation

**Seed:** `tests/seed.spec.ts`

#### 1.1. Admin can sign in and open the Training Programs page

**File:** `specs/admin-training-programs/admin-login-navigation.spec.ts`

**Steps:**
  1. Start from a fresh browser state at https://www.waveinitlms.online/login. If the Privacy & Cookie Preferences dialog is displayed, click Essential Only.
    - expect: The login page displays Admin, Trainer, and Learner role tabs.
    - expect: The cookie dialog is dismissed.
  2. Select the Admin tab.
    - expect: The Admin tab is selected.
    - expect: The form shows Username or Email, Password, Remember me, Forgot password?, and Sign in as Admin.
  3. Enter admin@test.com in Username or Email and admin123 in Password, then click Sign in as Admin.
    - expect: Authentication succeeds and the browser navigates to /admin.
    - expect: The Admin Portal dashboard is displayed and identifies the signed-in user as Sriram Admin · Online.
  4. Click the Training Programs button in the MANAGEMENT navigation.
    - expect: The URL includes /admin?tab=trainings.
    - expect: The Training Programs page shows the Training Sessions heading and Add Training control.
    - expect: The page exposes Search by title or trainer..., All, Active, Upcoming, and Completed controls, a training table, rows-per-page selection, and pagination.

#### 1.2. Admin can identify and verify an existing training program

**File:** `specs/admin-training-programs/identify-and-verify-program.spec.ts`

**Steps:**
  1. Log in as Admin from a fresh state and navigate to Training Programs.
    - expect: The Training Sessions list is visible.
  2. Identify one existing upcoming, zero-enrollment row using its complete values, for example Node.js Fundamentals 1789040988125, trainer01, 27 Jan 2027, 31 Jan 2027, capacity 25, enrolled 0.
    - expect: The selected row is uniquely identifiable even if multiple rows share a title.
    - expect: The row exposes View Details, Edit Training, Leaderboard, and Delete Training actions.
  3. Click View Details for the selected row.
    - expect: The Training Details panel displays the exact Title, UPCOMING status, Trainer, Start Date, End Date, Capacity, Enrolled count, and Description.
    - expect: The panel provides Close, Leaderboard, and Edit Training controls.

### 2. Training Program Editing And Validation

**Seed:** `tests/seed.spec.ts`

#### 2.1. Edit supported training fields and verify the save result

**File:** `specs/admin-training-programs/edit-training-program.spec.ts`

**Steps:**
  1. From a fresh state, log in as Admin, navigate to Training Programs, and identify a seeded zero-enrollment upcoming program by complete row values.
    - expect: The selected program can be opened without relying on a non-unique title alone.
  2. Open Edit Training and verify the form before changing values.
    - expect: The Edit Training Session form displays Title *, Description, Assign Trainer(s), Enable Sequential Learning Lock, Start Date, End Date, Capacity, Cancel, and Save Changes.
    - expect: The existing title, description, trainer assignment state, dates, and capacity are loaded.
    - expect: Title is required; dates are datetime-local controls; Capacity is a number control with minimum 1 and placeholder Unlimited.
  3. Change Title, Description, trainer assignment where a trainer option is available, Start Date, End Date, and Capacity to valid values while maintaining an end date after the start date and capacity at least 1. Click Save Changes.
    - expect: Expected product behavior: the panel closes or shows a success result, and the list reflects every changed value after refresh/reopen.
    - expect: Actual observed result for BUG-TP-002 reproduction: the edit panel remains open, entered values remain, and a notification says Server error updating training; the list retains the original row values.
  4. If the save error is shown, reopen or refresh the selected row and compare it with the original values.
    - expect: BUG-TP-002 is recorded as reproduced when the server-error notification appears and no edited values persist.
    - expect: No partial update is accepted as a pass.

#### 2.2. Required title validation prevents submission

**File:** `specs/admin-training-programs/required-title-validation.spec.ts`

**Steps:**
  1. From a fresh state, log in as Admin, navigate to Training Programs, open Edit Training for a uniquely identified existing program, and leave all other values unchanged.
    - expect: The edit form is displayed with the existing values.
  2. Clear the Title * field and click Save Changes.
    - expect: Submission is blocked by required-field validation.
    - expect: The title input remains focused/invalid and exposes the browser validation message Please fill out this field.
    - expect: No server-error update request or success notification is shown and the original list record remains unchanged.
  3. Enter a valid non-empty title and cancel the edit.
    - expect: The edit form closes without saving the invalid/temporary values.

#### 2.3. Reject invalid dates and capacity boundaries

**File:** `specs/admin-training-programs/edit-negative-validation.spec.ts`

**Steps:**
  1. From a fresh state, authenticate as Admin, navigate to Training Programs, and open Edit Training for an existing upcoming program with zero enrollment.
    - expect: The edit form displays editable Start Date, End Date, and Capacity controls.
  2. Set End Date earlier than Start Date and attempt to save.
    - expect: The UI rejects the invalid date range or the save result clearly reports the validation failure.
    - expect: The original program values remain unchanged.
  3. Set Capacity to 0 and attempt to save, then repeat with a negative value if the control accepts typed input.
    - expect: Capacity does not accept a value below the observed minimum of 1, or submission is rejected with validation feedback.
    - expect: No invalid capacity is persisted and the original row remains unchanged.
  4. Restore valid dates and capacity, then cancel the form.
    - expect: The form closes without persisting the negative-test values.

#### 2.4. Trainer assignment control behavior is discoverable

**File:** `specs/admin-training-programs/trainer-assignment.spec.ts`

**Steps:**
  1. From a fresh state, log in as Admin, navigate to Training Programs, identify a program, and open Edit Training.
    - expect: The form includes an Assign Trainer(s) section.
  2. Inspect the trainer assignment choices and select a supported trainer when options are available; if the list is empty, record the empty-state behavior.
    - expect: When options exist, the chosen trainer is visibly selected and remains selected before save.
    - expect: When no options exist, the Assign Trainer(s) area is documented as empty and the test is marked blocked/failed for trainer editing rather than silently passing.

### 3. Training Program Deletion

**Seed:** `tests/seed.spec.ts`

#### 3.1. Cancel deletion leaves the training program in the list

**File:** `specs/admin-training-programs/cancel-delete-training.spec.ts`

**Steps:**
  1. From a fresh state, log in as Admin, navigate to Training Programs, and identify a dedicated zero-enrollment seeded test program using complete title, trainer, dates, capacity, and enrolled values.
    - expect: The target program is present in the list.
  2. Click Delete Training for the target row.
    - expect: A confirmation panel asks Delete training "<title>"?
    - expect: The warning states This will remove all associated enrollments and feedback.
    - expect: Cancel and Confirm controls are available.
  3. Click Cancel.
    - expect: The confirmation closes.
    - expect: The target program remains in the list with unchanged values.

#### 3.2. Confirm deletion removes the training program from the list

**File:** `specs/admin-training-programs/confirm-delete-training.spec.ts`

**Steps:**
  1. From a fresh state, log in as Admin, navigate to Training Programs, and identify a dedicated zero-enrollment seeded test program by complete row values. Do not use a title-only match when duplicate titles exist.
    - expect: The target row is present and uniquely identified.
  2. Click Delete Training for the target row.
    - expect: The confirmation displays the exact target title and warns that associated enrollments and feedback will be removed.
  3. Click Confirm.
    - expect: A success notification says Training deleted successfully and states The training session has been removed.
    - expect: The confirmation closes and the target row is absent from the current list.
  4. Search for the exact target title and inspect the complete row/date values, then refresh or revisit Training Programs.
    - expect: The deleted target is absent from the filtered results and remains absent after refresh/revisit.
    - expect: Other records with similar or identical titles remain unaffected.
