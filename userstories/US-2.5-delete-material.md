# US-2.5: Delete Material

## Epic
Epic 2: Source Materials Management

## User Story
**As a** user
**I want** to delete a material I no longer use
**So that** I can keep my materials list clean

## Priority
High (MVP)

## Story Points
2

## Dependencies
- US-2.1: View All Materials
- US-9.4: Confirmation Dialogs

---

## Acceptance Criteria

### AC-1: Delete Action
- [ ] Delete action is available for each material in the list
- [ ] Delete action is clearly distinguishable (icon, red color)
- [ ] Delete action triggers confirmation dialog

### AC-2: Confirmation Dialog
- [ ] Dialog appears before deletion
- [ ] Dialog clearly states which material will be deleted
- [ ] Dialog has "Cancel" and "Delete" buttons
- [ ] Delete button is visually prominent (danger style)
- [ ] Escape key closes dialog without deleting

### AC-3: Deletion Prevention - Used in Recipes
- [ ] Cannot delete a material that is used in any recipe
- [ ] Clear error message explains why deletion is blocked
- [ ] Error lists which recipes use the material (optional)

### AC-4: Successful Deletion
- [ ] Material is permanently removed from database
- [ ] Material disappears from the list
- [ ] Success message/notification shown

### AC-5: Deletion Behavior
- [ ] Dialog closes after successful deletion
- [ ] List updates without full page refresh
- [ ] No navigation occurs (stays on materials page)

---

## Verification Steps

### Test 1: Delete Confirmation Dialog
1. Navigate to Materials page
2. Click delete on a material
3. **Verify**: Confirmation dialog appears
4. **Verify**: Dialog shows material name
5. **Verify**: Cancel and Delete buttons present

### Test 2: Cancel Deletion
1. Open delete confirmation for a material
2. Click Cancel
3. **Verify**: Dialog closes
4. **Verify**: Material still exists in list

### Test 3: Escape to Cancel
1. Open delete confirmation for a material
2. Press Escape key
3. **Verify**: Dialog closes
4. **Verify**: Material still exists

### Test 4: Successful Deletion
1. Create a material "Test Delete" not used in any recipe
2. Click delete on "Test Delete"
3. Confirm deletion
4. **Verify**: Dialog closes
5. **Verify**: "Test Delete" no longer in list
6. **Verify**: Success message appears

### Test 5: Permanent Deletion
1. Delete a material
2. Refresh the page
3. **Verify**: Material is still gone
4. Check database directly
5. **Verify**: Material record is deleted

### Test 6: Prevent Delete - Used in Recipe
1. Create material "Beef in Recipe"
2. Create a recipe with "Beef in Recipe" as ingredient
3. Try to delete "Beef in Recipe"
4. **Verify**: Error message appears
5. **Verify**: Message indicates material is used in recipes
6. **Verify**: Material is NOT deleted

### Test 7: Delete After Removing from Recipe
1. Remove "Beef in Recipe" from the recipe
2. Try to delete "Beef in Recipe" again
3. **Verify**: Deletion succeeds

### Test 8: Click Outside Dialog
1. Open delete confirmation
2. Click outside the dialog overlay
3. **Verify**: Dialog closes without deleting

### Test 9: Multiple Quick Deletions
1. Have 3 unused materials
2. Delete first one, confirm
3. Immediately delete second one, confirm
4. Delete third one, confirm
5. **Verify**: All three are deleted
6. **Verify**: No errors or race conditions

---

## UI Mockup Description

### Delete Button in List
```
| Material Name  | Price  | Unit | Actions                    |
|----------------|--------|------|----------------------------|
| Beef           | €25.00 | kg   | [Edit] [Archive] [🗑Delete] |
```

### Confirmation Dialog
```
+------------------------------------------+
|          Delete Material                 |
+------------------------------------------+
| Are you sure you want to delete          |
| "Beef Tenderloin"?                       |
|                                          |
| This action cannot be undone.            |
|                                          |
|              [Cancel]  [Delete]          |
+------------------------------------------+
```

### Error Dialog (Material in Use)
```
+------------------------------------------+
|          Cannot Delete                   |
+------------------------------------------+
| "Beef Tenderloin" cannot be deleted      |
| because it is used in the following      |
| recipes:                                 |
|                                          |
| • Beef Stew                              |
| • Roast Beef                             |
|                                          |
| Remove it from these recipes first,      |
| or archive the material instead.         |
|                                          |
|                            [OK]          |
+------------------------------------------+
```

---

## Technical Notes

- IPC call: `materials:delete(id: string)`
- Backend enforces foreign key constraint (RESTRICT)
- Return specific error type for "UsedInRecipes"
- Optionally include recipe names in error response

```typescript
// Error response example
{
  type: 'UsedInRecipes',
  message: 'Material is used in recipes',
  recipeNames: ['Beef Stew', 'Roast Beef']
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Delete button styled as danger action
- [ ] Dialog is accessible (focus management)
- [ ] Code reviewed
