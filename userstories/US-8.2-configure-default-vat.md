# US-8.2: Configure Default VAT Rate

## Epic
Epic 8: Settings Management

## User Story
**As a** user
**I want** to set a default VAT rate
**So that** new recipes use my standard rate

## Priority
Low

## Story Points
1

## Dependencies
- US-8.1: Configure Labor Rate

---

## Acceptance Criteria

### AC-1: VAT Field
- [ ] Input field for default VAT percentage
- [ ] Shows current value
- [ ] Percentage label (%)

### AC-2: Validation
- [ ] Must be 0-100
- [ ] Must be a valid number

### AC-3: Default Value
- [ ] Default: 21%

### AC-4: New Recipe Behavior
- [ ] New recipes pre-fill with default VAT
- [ ] User can override per recipe

---

## Verification Steps

### Test 1: View Default VAT
1. Navigate to Settings
2. **Verify**: Default VAT field visible
3. **Verify**: Shows 21%

### Test 2: Update VAT
1. Change to 9%
2. Save
3. Refresh
4. **Verify**: Still 9%

### Test 3: New Recipe Uses Default
1. Set default VAT to 6%
2. Create new recipe
3. **Verify**: VAT field pre-filled with 6%

### Test 4: Override Per Recipe
1. Create recipe
2. Change VAT from default to 21%
3. Save
4. **Verify**: Recipe has 21% (not default)

---

## UI Mockup Description

```
| VAT                                              |
| +-----------------------------------------------+|
| | Default VAT Rate                              ||
| | [21_______] %                                 ||
| |                                               ||
| | Applied to new recipes. Can be overridden     ||
| | per recipe.                                   ||
| +-----------------------------------------------+|
```

---

## Technical Notes

- Setting key: `default_vat_rate`
- Setting type: `number`

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] New recipes use default
- [ ] Code reviewed
