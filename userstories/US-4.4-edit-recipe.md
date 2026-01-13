# US-4.4: Edit Recipe

## Epic
Epic 4: Recipe Management

## User Story
**As a** user
**I want** to modify recipe details
**So that** I can update ingredients, quantities, or pricing

## Priority
High (MVP)

## Story Points
8

## Dependencies
- US-4.2: Create Recipe
- US-4.3: View Recipe Details
- US-5.1: Add Ingredient to Recipe
- US-6.1: Add Packaging to Recipe

---

## Acceptance Criteria

### AC-1: Edit Page Access
- [ ] Edit button from detail page navigates to edit
- [ ] URL: `/recipes/{id}/edit`
- [ ] Page title: "Edit Recipe" or recipe name

### AC-2: Metadata Editing
- [ ] All metadata fields editable (same as create)
- [ ] Form pre-populated with current values
- [ ] Same validation as create

### AC-3: Ingredients Section
- [ ] List of current ingredients shown
- [ ] Add ingredient button/action
- [ ] Edit each ingredient (quantity, unit, notes)
- [ ] Remove ingredient button
- [ ] Drag-and-drop reordering

### AC-4: Packaging Section
- [ ] List of current packaging shown
- [ ] Add packaging button/action
- [ ] Edit each packaging (quantity, notes)
- [ ] Remove packaging button

### AC-5: Real-time Cost Updates
- [ ] Cost breakdown updates as ingredients change
- [ ] No save required to see cost changes
- [ ] Shows current total cost

### AC-6: Save Behavior
- [ ] Save button saves all changes (metadata + ingredients + packaging)
- [ ] Success message on save
- [ ] Can continue editing after save
- [ ] Or redirect to detail page

### AC-7: Cancel Behavior
- [ ] Cancel discards unsaved changes
- [ ] Confirmation if unsaved changes exist
- [ ] Returns to detail or list page

---

## Verification Steps

### Test 1: Navigate to Edit
1. View recipe detail
2. Click Edit
3. **Verify**: Edit page loads
4. **Verify**: All fields populated

### Test 2: Update Metadata
1. Change description
2. Change profit margin
3. Save
4. **Verify**: Changes saved
5. View detail page
6. **Verify**: New values shown

### Test 3: Add Ingredient
1. Click Add Ingredient
2. Select material, enter quantity
3. **Verify**: Ingredient appears in list
4. **Verify**: Cost updates immediately

### Test 4: Edit Ingredient
1. Change ingredient quantity from 2kg to 3kg
2. **Verify**: Line cost updates
3. **Verify**: Total cost updates
4. Save

### Test 5: Remove Ingredient
1. Click remove on an ingredient
2. **Verify**: Ingredient removed from list
3. **Verify**: Cost updates
4. Save

### Test 6: Reorder Ingredients
1. Drag ingredient from position 3 to position 1
2. **Verify**: Order updates visually
3. Save
4. Reload page
5. **Verify**: New order persisted

### Test 7: Add Packaging
1. Click Add Packaging
2. Select packaging, enter quantity
3. **Verify**: Appears in list
4. **Verify**: Packaging cost updates

### Test 8: Real-time Cost
1. Note total cost
2. Add ingredient worth €10
3. **Verify**: Total increases by €10 immediately
4. (No save yet)

### Test 9: Cancel with Changes
1. Make changes
2. Click Cancel
3. **Verify**: Confirmation dialog appears
4. Confirm cancel
5. **Verify**: Changes not saved

### Test 10: Name Uniqueness
1. Try to rename to existing recipe name
2. Save
3. **Verify**: Duplicate error

---

## UI Mockup Description

```
+------------------------------------------------------------------+
| < Back                                           [Cancel] [Save]  |
+------------------------------------------------------------------+
| Edit: Beef Stew                                                   |
+------------------------------------------------------------------+
| RECIPE DETAILS                                                    |
| +--------------------------------------------------------------+ |
| | Name: [Beef Stew___________]                                  | |
| | Description: [A hearty stew...]                               | |
| | Yield: [4] [portions ▼]                                       | |
| | Prep Time: [60] minutes                                       | |
| | Profit: [25]%  Waste: [5]%  VAT: [21]%                        | |
| +--------------------------------------------------------------+ |
|                                                                   |
| INGREDIENTS                                    [+ Add Ingredient] |
| +--------------------------------------------------------------+ |
| | ≡ | Beef Chuck    | [2___] [kg ▼] | €50.00 | [notes] | [x]  | |
| | ≡ | Onions        | [0.5_] [kg ▼] | €1.00  | [notes] | [x]  | |
| | ≡ | Carrots       | [0.3_] [kg ▼] | €0.60  | [notes] | [x]  | |
| +--------------------------------------------------------------+ |
| Material Cost: €51.60                                             |
|                                                                   |
| PACKAGING                                        [+ Add Packaging]|
| +--------------------------------------------------------------+ |
| | Container       | [4___] piece   | €2.00  | [notes] | [x]    | |
| +--------------------------------------------------------------+ |
| Packaging Cost: €2.00                                             |
|                                                                   |
| COST SUMMARY                                                      |
| +--------------------------------------------------------------+ |
| | Materials: €51.60 | Labor: €25.00 | Packaging: €2.00          | |
| | TOTAL: €78.60                                                 | |
| +--------------------------------------------------------------+ |
|                                                                   |
| INSTRUCTIONS                                                      |
| [1. Cut beef into cubes...                                     ] |
+------------------------------------------------------------------+
```

---

## Technical Notes

- Multiple IPC calls needed:
  - `recipes:get(id)`
  - `recipes:update(id, data)`
  - `ingredients:add/update/remove`
  - `packaging:add/update/remove`
  - `ingredients:reorder(recipeId, ids[])`
- Consider optimistic updates for real-time feel
- Use form state management (react-hook-form)

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Real-time cost updates work
- [ ] Drag-and-drop works smoothly
- [ ] Unsaved changes warning works
- [ ] Code reviewed
