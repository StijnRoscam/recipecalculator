# US-6.3: Remove Recipe Packaging

## Epic
Epic 6: Recipe Packaging

## User Story
**As a** user
**I want** to remove packaging from a recipe
**So that** I can adjust packaging configuration

## Priority
Medium

## Story Points
1

## Dependencies
- US-6.1: Add Packaging to Recipe

---

## Acceptance Criteria

### AC-1: Remove Button
- [ ] Remove button for each packaging row

### AC-2: Immediate Update
- [ ] Packaging disappears from list
- [ ] Packaging cost updates

### AC-3: No Confirmation
- [ ] Direct removal (can re-add)

---

## Verification Steps

### Test 1: Remove Packaging
1. Packaging cost = €2.00 (includes Bag €0.60)
2. Remove Bag
3. **Verify**: Bag gone from list
4. **Verify**: Packaging cost = €1.40

### Test 2: Remove All
1. Remove all packaging
2. **Verify**: Packaging cost = €0
3. **Verify**: "No packaging" state

---

## Technical Notes

- IPC: `packaging:removeFromRecipe(recipePackagingId: string)`

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Code reviewed
