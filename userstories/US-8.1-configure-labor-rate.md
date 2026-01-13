# US-8.1: Configure Labor Rate

## Epic
Epic 8: Settings Management

## User Story
**As a** user
**I want** to set my hourly labor rate
**So that** labor costs are calculated correctly

## Priority
High (MVP)

## Story Points
2

## Dependencies
- US-1.1: Application Launch (settings initialized)

---

## Acceptance Criteria

### AC-1: Settings Page Access
- [ ] Settings page accessible from navigation
- [ ] URL: `/settings`

### AC-2: Labor Rate Field
- [ ] Input field for hourly rate
- [ ] Shows current value
- [ ] Currency label (EUR/hour)

### AC-3: Validation
- [ ] Must be >= 0
- [ ] Must be a valid number
- [ ] Accepts decimals

### AC-4: Persistence
- [ ] Value saved to database
- [ ] Persists across sessions

### AC-5: Default Value
- [ ] Default: €25.00/hour
- [ ] Set automatically on first run

### AC-6: Impact on Recipes
- [ ] All recipe labor costs use this rate
- [ ] Changes affect all recipes immediately

---

## Verification Steps

### Test 1: View Current Rate
1. Navigate to Settings
2. **Verify**: Labor rate field visible
3. **Verify**: Shows default €25.00

### Test 2: Update Rate
1. Change to €30.00
2. Save
3. **Verify**: Success message
4. Refresh page
5. **Verify**: Still €30.00

### Test 3: Validation
1. Enter -10
2. **Verify**: Error "must be 0 or greater"
3. Enter "abc"
4. **Verify**: Error "must be a number"

### Test 4: Recipe Impact
1. Recipe with 60 min prep time
2. Labor rate: €25/hour → Labor cost: €25
3. Change rate to €30/hour
4. View recipe
5. **Verify**: Labor cost now €30

### Test 5: Decimal Value
1. Enter €27.50
2. Save
3. **Verify**: Value saved correctly

---

## UI Mockup Description

```
+--------------------------------------------------+
| Settings                                          |
+--------------------------------------------------+
|                                                   |
| LABOR COSTS                                       |
| +-----------------------------------------------+ |
| | Hourly Labor Rate                             | |
| | [25.00_____] EUR/hour                         | |
| |                                               | |
| | This rate is used to calculate labor costs    | |
| | based on recipe prep time.                    | |
| +-----------------------------------------------+ |
|                                                   |
|                                      [Save]       |
+--------------------------------------------------+
```

---

## Technical Notes

- Setting key: `labor_rate_per_hour`
- Setting type: `number`
- IPC: `settings:get('labor_rate_per_hour')`
- IPC: `settings:update('labor_rate_per_hour', { value: 30, type: 'number' })`

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Default value created on first run
- [ ] All recipes use current rate
- [ ] Code reviewed
