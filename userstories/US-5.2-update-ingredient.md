# US-5.2: Update Ingredient

## Epic
Epic 5: Ingredients Management

## User Story
**As a** user
**I want** to change ingredient quantities
**So that** I can adjust the recipe

## Priority
High (MVP)

## Story Points
2

## Dependencies
- US-5.1: Add Ingredient to Recipe

---

## Acceptance Criteria

### AC-1: Inline Editing
- [ ] Quantity editable directly in ingredient row
- [ ] Unit changeable via dropdown
- [ ] Notes editable

### AC-2: Real-time Updates
- [ ] Line cost updates as quantity changes
- [ ] Total material cost updates
- [ ] No save button needed for preview

### AC-3: Validation
- [ ] Quantity must be > 0
- [ ] Inline error message if invalid

### AC-4: Persistence
- [ ] Changes saved when recipe is saved
- [ ] Or auto-save after edit (depends on implementation)

---

## Verification Steps

### Test 1: Change Quantity
1. Ingredient: Beef 2kg = €50
2. Change to 3kg
3. **Verify**: Line cost = €75
4. **Verify**: Total updates

### Test 2: Change Unit
1. Ingredient: 1000g (material €10/kg)
2. Change unit to kg, quantity to 1
3. **Verify**: Cost remains €10

### Test 3: Invalid Quantity
1. Clear quantity field
2. **Verify**: Error shown
3. Enter 0
4. **Verify**: Error "must be > 0"

### Test 4: Update Notes
1. Add/change notes
2. Save recipe
3. Reload
4. **Verify**: Notes preserved

### Test 5: Multiple Edits
1. Change 3 ingredients
2. Save
3. Reload
4. **Verify**: All changes preserved

---

## UI Mockup Description

```
INGREDIENTS
+--------------------------------------------------------------+
| ≡ | Beef Chuck    | [2___] [kg ▼] | €50.00 | [notes___] | [x] |
| ≡ | Salt          | [50__] [g ▼]  | €0.05  | [________] | [x] |
+--------------------------------------------------------------+
                                      ▲
                                      Editable fields
```

---

## Technical Notes

- IPC: `ingredients:update(id, data: UpdateIngredientInput)`
- May use debounce for auto-save
- Or batch updates when main save clicked

```typescript
interface UpdateIngredientInput {
  quantity?: number;
  unit?: 'kg' | 'g';
  notes?: string | null;
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Real-time cost updates
- [ ] Code reviewed
