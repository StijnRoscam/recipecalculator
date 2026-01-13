# US-3.4: Delete Packaging Material

## Epic
Epic 3: Packaging Materials Management

## User Story
**As a** user
**I want** to delete unused packaging materials
**So that** I can keep my list organized

## Priority
Medium

## Story Points
2

## Dependencies
- US-3.1: View All Packaging Materials
- US-9.4: Confirmation Dialogs

---

## Acceptance Criteria

### AC-1: Delete Action
- [ ] Delete action available for each item
- [ ] Triggers confirmation dialog

### AC-2: Confirmation Dialog
- [ ] Shows packaging name
- [ ] Cancel and Delete buttons
- [ ] Escape closes without deleting

### AC-3: Deletion Prevention
- [ ] Cannot delete if used in any recipe
- [ ] Clear error message when blocked
- [ ] Suggests archiving as alternative

### AC-4: Successful Deletion
- [ ] Permanently removes from database
- [ ] Item disappears from list
- [ ] Success message shown

---

## Verification Steps

### Test 1: Delete Confirmation
1. Click delete on unused packaging
2. **Verify**: Dialog shows item name
3. Click Cancel
4. **Verify**: Item still exists

### Test 2: Successful Delete
1. Create "Unused Bag" not used in recipes
2. Delete it
3. Confirm
4. **Verify**: Item gone from list
5. Refresh page
6. **Verify**: Still gone

### Test 3: Blocked by Recipe
1. Create "Recipe Box"
2. Add to a recipe
3. Try to delete "Recipe Box"
4. **Verify**: Error message
5. **Verify**: Item NOT deleted

### Test 4: Delete After Removing from Recipe
1. Remove "Recipe Box" from recipe
2. Delete "Recipe Box"
3. **Verify**: Deletion succeeds

### Test 5: Escape to Cancel
1. Open delete dialog
2. Press Escape
3. **Verify**: Dialog closes
4. **Verify**: Item exists

---

## UI Mockup Description

### Error Dialog
```
+------------------------------------------+
|          Cannot Delete                   |
+------------------------------------------+
| "Vacuum Bag Small" cannot be deleted     |
| because it is used in recipes:           |
|                                          |
| • Beef Package                           |
|                                          |
| Consider archiving instead.              |
|                                          |
|                            [OK]          |
+------------------------------------------+
```

---

## Technical Notes

- IPC: `packaging:delete(id)`
- Foreign key RESTRICT prevents deletion if used
- Return recipe names in error for better UX

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Proper error when used in recipes
- [ ] Code reviewed
