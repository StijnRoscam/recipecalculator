# US-6.1: Add Packaging to Recipe

## Epic
Epic 6: Recipe Packaging

## User Story
**As a** user
**I want** to add packaging materials to a recipe
**So that** packaging costs are included in pricing

## Priority
High (MVP)

## Story Points
3

## Dependencies
- US-4.4: Edit Recipe
- US-3.1: View All Packaging Materials

---

## Acceptance Criteria

### AC-1: Add Action
- [ ] "Add Packaging" button on recipe edit page
- [ ] Opens packaging selection dialog

### AC-2: Packaging Selection
- [ ] Searchable list of packaging materials
- [ ] Only non-archived packaging shown
- [ ] Name, price, and unit type visible

### AC-3: Quantity Input
- [ ] Quantity field (required, > 0)
- [ ] Unit type shown (from material, not editable)

### AC-4: Optional Notes
- [ ] Notes field for specifics

### AC-5: Validation
- [ ] Quantity must be > 0
- [ ] Duplicate packaging allowed (different sizes, etc.)

### AC-6: Success Behavior
- [ ] Packaging appears in list
- [ ] Packaging cost updates

---

## Verification Steps

### Test 1: Add Packaging
1. Click "Add Packaging"
2. Select "Vacuum Bag" (€0.15/piece)
3. Enter quantity: 4
4. Click Add
5. **Verify**: "Vacuum Bag x4" in list
6. **Verify**: Line cost = €0.60

### Test 2: Cost Update
1. Add packaging worth €2
2. **Verify**: Packaging cost section shows €2
3. **Verify**: Total cost increases by €2

### Test 3: Search Packaging
1. Search "bag"
2. **Verify**: Only bag items shown

### Test 4: Cancel
1. Open dialog
2. Cancel
3. **Verify**: Nothing added

---

## UI Mockup Description

```
+------------------------------------------+
|         Add Packaging                    |
+------------------------------------------+
| Search: [_______________]                 |
|                                          |
| Select Packaging:                        |
| +--------------------------------------+ |
| | ○ Vacuum Bag Small    €0.15/piece   | |
| | ○ Vacuum Bag Large    €0.25/piece   | |
| | ○ Butcher Paper       €2.50/roll    | |
| +--------------------------------------+ |
|                                          |
| Quantity *                               |
| [4_______]  (piece)                      |
|                                          |
| Notes                                    |
| [________________________]               |
|                                          |
|              [Cancel]  [Add Packaging]   |
+------------------------------------------+
```

---

## Technical Notes

- IPC: `packaging:addToRecipe(recipeId, data)`

```typescript
interface AddRecipePackagingInput {
  packagingMaterialId: string;
  quantity: number;
  notes?: string;
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Code reviewed
