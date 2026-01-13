# US-5.1: Add Ingredient to Recipe

## Epic
Epic 5: Ingredients Management

## User Story
**As a** user
**I want** to add ingredients to a recipe
**So that** I can build up the recipe's composition

## Priority
High (MVP)

## Story Points
5

## Dependencies
- US-4.4: Edit Recipe
- US-2.1: View All Materials (for selection)

---

## Acceptance Criteria

### AC-1: Add Action
- [ ] "Add Ingredient" button on recipe edit page
- [ ] Opens ingredient selection dialog

### AC-2: Material Selection
- [ ] Searchable list of materials
- [ ] Only non-archived materials shown
- [ ] Material name and price visible
- [ ] Search is case-insensitive

### AC-3: Quantity Input
- [ ] Quantity field (required, > 0)
- [ ] Unit selector (kg or g only)
- [ ] Default unit: kg

### AC-4: Optional Notes
- [ ] Notes field for ingredient-specific info
- [ ] Optional

### AC-5: Validation
- [ ] Quantity must be > 0
- [ ] Cannot add same material twice to recipe
- [ ] Clear error for duplicate

### AC-6: Success Behavior
- [ ] Dialog closes
- [ ] Ingredient appears in list
- [ ] Costs update immediately
- [ ] No save required (auto-save or wait for main save)

---

## Verification Steps

### Test 1: Open Add Dialog
1. Edit a recipe
2. Click "Add Ingredient"
3. **Verify**: Dialog opens
4. **Verify**: Materials list shown

### Test 2: Search Materials
1. In dialog, search "beef"
2. **Verify**: Only beef materials shown
3. Clear search
4. **Verify**: All materials shown

### Test 3: Select and Add
1. Select "Beef Chuck"
2. Enter quantity: 2
3. Select unit: kg
4. Click Add
5. **Verify**: Dialog closes
6. **Verify**: "Beef Chuck - 2 kg" in ingredients list

### Test 4: Cost Update
1. Beef Chuck is €25/kg
2. Add 2 kg
3. **Verify**: Line cost shows €50.00
4. **Verify**: Total material cost increases by €50

### Test 5: Unit Conversion
1. Add ingredient in grams (500g)
2. Material priced per kg (€10/kg)
3. **Verify**: Line cost = €5.00

### Test 6: Duplicate Prevention
1. Add "Salt" to recipe
2. Try to add "Salt" again
3. **Verify**: Error "This material is already in the recipe"

### Test 7: Archived Materials Hidden
1. Archive a material
2. Open add ingredient dialog
3. Search for archived material
4. **Verify**: Not found in list

### Test 8: Cancel
1. Open add dialog
2. Select material
3. Click Cancel
4. **Verify**: No ingredient added

### Test 9: Invalid Quantity
1. Enter quantity: 0
2. Try to add
3. **Verify**: Error "Quantity must be greater than 0"

### Test 10: Notes
1. Add ingredient with note "Extra lean"
2. **Verify**: Note is saved
3. **Verify**: Note visible in ingredient list

---

## UI Mockup Description

```
+------------------------------------------+
|         Add Ingredient                   |
+------------------------------------------+
| Search: [_______________] 🔍              |
|                                          |
| Select Material:                         |
| +--------------------------------------+ |
| | ○ Beef Chuck        €25.00/kg       | |
| | ○ Beef Tenderloin   €45.00/kg       | |
| | ○ Chicken Breast    €12.00/kg       | |
| | ○ Pork Loin         €15.00/kg       | |
| +--------------------------------------+ |
|                                          |
| Quantity *                               |
| [2_______] [kg ▼]                       |
|                                          |
| Notes                                    |
| [________________________]               |
|                                          |
|              [Cancel]  [Add Ingredient]  |
+------------------------------------------+
```

---

## Technical Notes

- IPC: `ingredients:add(recipeId, data: AddIngredientInput)`
- Fetch materials: `materials:getAll(false)` (exclude archived)

```typescript
interface AddIngredientInput {
  materialId: string;
  quantity: number;
  unit: 'kg' | 'g';
  notes?: string;
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Material search works smoothly
- [ ] Cost calculations correct
- [ ] Code reviewed
