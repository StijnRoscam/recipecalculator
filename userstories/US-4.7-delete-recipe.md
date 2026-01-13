# US-4.7: Delete Recipe

## Epic
Epic 4: Recipe Management

## User Story
**As a** user
**I want** to delete recipes I no longer need
**So that** I can keep my recipe list organized

## Priority
Medium

## Story Points
2

## Dependencies
- US-4.1: View All Recipes
- US-9.4: Confirmation Dialogs

---

## Acceptance Criteria

### AC-1: Delete Action Access
- [ ] Available from recipe card actions menu
- [ ] Available from recipe detail page
- [ ] Styled as danger action (red)

### AC-2: Confirmation Dialog
- [ ] Appears before deletion
- [ ] Shows recipe name
- [ ] Warns that deletion is permanent
- [ ] Cancel and Delete buttons
- [ ] Delete button styled as danger

### AC-3: Cascade Deletion
- [ ] Recipe is deleted
- [ ] All ingredients are deleted
- [ ] All packaging links are deleted
- [ ] No orphaned records

### AC-4: Success Behavior
- [ ] Success message
- [ ] Recipe removed from list/grid
- [ ] If on detail page, navigate to recipes list

### AC-5: No Restrictions
- [ ] Recipes can always be deleted (unlike materials)
- [ ] No foreign key preventing deletion

---

## Verification Steps

### Test 1: Delete from Card
1. Click actions on recipe card
2. Click Delete
3. **Verify**: Confirmation dialog
4. Confirm
5. **Verify**: Recipe gone from grid

### Test 2: Delete from Detail
1. View recipe detail
2. Click Delete
3. Confirm
4. **Verify**: Navigated to recipes list
5. **Verify**: Recipe not in list

### Test 3: Cancel Delete
1. Click Delete
2. Click Cancel in dialog
3. **Verify**: Recipe still exists

### Test 4: Escape to Cancel
1. Open delete dialog
2. Press Escape
3. **Verify**: Dialog closes
4. **Verify**: Recipe exists

### Test 5: Ingredients Deleted
1. Recipe has 3 ingredients
2. Delete recipe
3. Check database
4. **Verify**: Recipe record gone
5. **Verify**: 3 ingredient records gone

### Test 6: Packaging Deleted
1. Recipe has packaging
2. Delete recipe
3. Check database
4. **Verify**: Packaging links gone
5. **Verify**: Packaging materials themselves still exist

### Test 7: Permanent Deletion
1. Delete recipe
2. Refresh page
3. **Verify**: Recipe still gone
4. Close and reopen app
5. **Verify**: Recipe still gone

---

## UI Mockup Description

```
+------------------------------------------+
|          Delete Recipe                   |
+------------------------------------------+
| Are you sure you want to delete          |
| "Beef Stew"?                             |
|                                          |
| This will permanently delete the recipe  |
| and all its ingredients. This action     |
| cannot be undone.                        |
|                                          |
|              [Cancel]  [Delete]          |
+------------------------------------------+
```

---

## Technical Notes

- IPC: `recipes:delete(id: string)`
- Database: ON DELETE CASCADE handles ingredients/packaging
- No need for explicit ingredient deletion

```sql
-- Table definition ensures cascade
CREATE TABLE recipe_ingredients (
  ...
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE
);
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Cascade deletion works
- [ ] No orphaned data
- [ ] Code reviewed
