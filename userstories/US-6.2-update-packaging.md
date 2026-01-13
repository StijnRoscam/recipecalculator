# US-6.2: Update Recipe Packaging

## Epic
Epic 6: Recipe Packaging

## User Story
**As a** user
**I want** to change packaging quantities
**So that** I can adjust for different package sizes

## Priority
Medium

## Story Points
1

## Dependencies
- US-6.1: Add Packaging to Recipe

---

## Acceptance Criteria

### AC-1: Inline Editing
- [ ] Quantity editable in packaging row
- [ ] Notes editable

### AC-2: Real-time Cost
- [ ] Line cost updates on quantity change
- [ ] Total packaging cost updates

### AC-3: Validation
- [ ] Quantity must be > 0

---

## Verification Steps

### Test 1: Change Quantity
1. Packaging: 4 bags @ €0.15 = €0.60
2. Change to 10 bags
3. **Verify**: Line cost = €1.50

### Test 2: Invalid Quantity
1. Enter 0
2. **Verify**: Error shown

### Test 3: Update Notes
1. Add notes
2. Save
3. **Verify**: Notes preserved

---

## Technical Notes

- IPC: `packaging:updateRecipePackaging(id, data)`

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Code reviewed
