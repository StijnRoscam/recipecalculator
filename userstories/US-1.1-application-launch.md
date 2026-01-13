# US-1.1: Application Launch

## Epic
Epic 1: Application Setup

## User Story
**As a** user
**I want** the application to launch quickly and reliably
**So that** I can start working without delays

## Priority
High (MVP)

## Story Points
5

## Dependencies
None (foundational story)

---

## Acceptance Criteria

### AC-1: Application Opens Successfully
- [ ] Application window appears when launched
- [ ] No crash or error dialogs on startup
- [ ] Window is properly sized (minimum 1024x768)
- [ ] Window is centered on screen

### AC-2: Startup Performance
- [ ] Application is usable within 3 seconds of launch
- [ ] Splash screen or loading indicator shown if initialization takes > 500ms

### AC-3: Database Initialization
- [ ] SQLite database file is created automatically on first run
- [ ] All database tables are created via migrations
- [ ] Database uses WAL mode for performance
- [ ] No user action required for database setup

### AC-4: Default Settings
- [ ] Default labor rate (25.00 EUR/hour) is created if not present
- [ ] Default VAT rate (21%) is created if not present
- [ ] Settings are persisted in database

### AC-5: Error Handling
- [ ] If database creation fails, user sees a clear error message
- [ ] Application does not crash on database errors
- [ ] Error includes actionable information (e.g., check permissions)

---

## Verification Steps

### Test 1: Fresh Install Launch
1. Delete any existing database file
2. Launch the application
3. **Verify**: Application opens without errors
4. **Verify**: Database file is created
5. **Verify**: Default settings exist in database

### Test 2: Subsequent Launch
1. Close the application
2. Relaunch the application
3. **Verify**: Application opens without errors
4. **Verify**: Previous data is preserved
5. **Verify**: No duplicate settings created

### Test 3: Startup Timing
1. Use a stopwatch or timer
2. Launch the application
3. **Verify**: Main window is interactive within 3 seconds

### Test 4: Window Properties
1. Launch the application
2. **Verify**: Window is centered on primary display
3. **Verify**: Window has reasonable default size
4. **Verify**: Window can be resized and moved

### Test 5: Database Integrity
1. Launch the application
2. Open the SQLite database with a tool (e.g., DB Browser)
3. **Verify**: All expected tables exist:
   - source_materials
   - recipes
   - recipe_ingredients
   - packaging_materials
   - recipe_packaging
   - settings
   - categories
   - price_history
4. **Verify**: Foreign key constraints are enabled

---

## Technical Notes

- Use electron-vite or electron-forge for project setup
- Database path: `app.getPath('userData')/butchercalculator.db`
- Run migrations synchronously on app startup
- Use better-sqlite3 for synchronous SQLite access

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Code reviewed
- [ ] No console errors on startup
