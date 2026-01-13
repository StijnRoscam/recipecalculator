# US-5.3: Remove Ingredient

## Epic
Epic 5: Ingredients Management

## User Story
**As a** user
**I want** to remove ingredients from a recipe
**So that** I can correct mistakes or simplify recipes

## Priority
High (MVP)

## Story Points
1

## Dependencies
- US-5.1: Add Ingredient to Recipe

---

## Acceptance Criteria

### AC-1: Remove Button
- [ ] Remove/delete button for each ingredient row
- [ ] Clearly visible (X icon or trash)

### AC-2: No Confirmation
- [ ] Immediate removal (can re-add)
- [ ] No confirmation dialog needed

### AC-3: Immediate Update
- [ ] Ingredient disappears from list
- [ ] Costs update immediately

### AC-4: Persistence
- [ ] Removal saved when recipe is saved
- [ ] Or immediately persisted

---

## Verification Steps

### Test 1: Remove Ingredient
1. Recipe has Beef (€50)
2. Click remove on Beef
3. **Verify**: Beef gone from list
4. **Verify**: Material cost decreases by €50

### Test 2: Remove All Ingredients
1. Remove all ingredients
2. **Verify**: "No ingredients" state shown
3. **Verify**: Material cost = €0

### Test 3: Re-add After Remove
1. Remove "Salt"
2. Add "Salt" again
3. **Verify**: Salt added successfully

### Test 4: Persistence
1. Remove ingredient
2. Save recipe
3. Reload page
4. **Verify**: Ingredient still removed

---

## UI Mockup Description

```
| Beef Chuck | 2 kg | €50.00 | [x] |  <- Click X to remove
```

---

## Technical Notes

- IPC: `ingredients:remove(ingredientId: string)`
- Delete from recipe_ingredients table

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Code reviewed
