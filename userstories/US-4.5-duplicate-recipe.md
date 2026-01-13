# US-4.5: Duplicate Recipe

## Epic
Epic 4: Recipe Management

## User Story
**As a** user
**I want** to duplicate an existing recipe
**So that** I can create variations without starting from scratch

## Priority
Medium

## Story Points
2

## Dependencies
- US-4.1: View All Recipes
- US-4.3: View Recipe Details

---

## Acceptance Criteria

### AC-1: Duplicate Action Access
- [ ] Available from recipe card actions menu
- [ ] Available from recipe detail page
- [ ] Action clearly labeled "Duplicate"

### AC-2: Name Prompt
- [ ] Dialog prompts for new recipe name
- [ ] Suggested name: "{Original} (Copy)" or similar
- [ ] Name field is editable
- [ ] Cancel option available

### AC-3: Validation
- [ ] New name must be unique
- [ ] Same validation as create (1-200 chars)
- [ ] Error shown if name exists

### AC-4: What Gets Copied
- [ ] All metadata (description, yield, prep time, margins, VAT, instructions)
- [ ] All ingredients with quantities
- [ ] All packaging with quantities
- [ ] NOT copied: favorite status (defaults to false)
- [ ] NOT copied: archived status (defaults to false)

### AC-5: Success Behavior
- [ ] New recipe created in database
- [ ] Success message with new recipe name
- [ ] Navigate to new recipe's edit or detail page
- [ ] Original recipe unchanged

---

## Verification Steps

### Test 1: Duplicate from Card
1. Click actions menu on recipe card
2. Click Duplicate
3. **Verify**: Name prompt appears
4. **Verify**: Suggested name shown

### Test 2: Duplicate from Detail
1. View recipe detail page
2. Click Duplicate button
3. **Verify**: Name prompt appears

### Test 3: Accept Default Name
1. Duplicate "Beef Stew"
2. Accept suggested name "Beef Stew (Copy)"
3. **Verify**: New recipe created
4. **Verify**: Navigated to new recipe

### Test 4: Custom Name
1. Duplicate recipe
2. Change name to "Spicy Beef Stew"
3. Confirm
4. **Verify**: Recipe created with custom name

### Test 5: Duplicate Name Error
1. Duplicate "Beef Stew"
2. Enter "Chicken Soup" (existing recipe)
3. **Verify**: Error "Name already exists"
4. **Verify**: Still in dialog, can change name

### Test 6: Cancel Duplicate
1. Click Duplicate
2. Click Cancel
3. **Verify**: No new recipe created
4. **Verify**: Dialog closes

### Test 7: Ingredients Copied
1. Original has 3 ingredients
2. Duplicate recipe
3. View new recipe
4. **Verify**: Same 3 ingredients
5. **Verify**: Same quantities

### Test 8: Packaging Copied
1. Original has 2 packaging items
2. Duplicate recipe
3. View new recipe
4. **Verify**: Same 2 packaging items

### Test 9: Favorite Not Copied
1. Original recipe is favorite
2. Duplicate recipe
3. **Verify**: New recipe is NOT favorite

### Test 10: Original Unchanged
1. Note original recipe details
2. Duplicate recipe
3. Modify new recipe (change ingredient)
4. View original
5. **Verify**: Original unchanged

---

## UI Mockup Description

### Duplicate Dialog
```
+------------------------------------------+
|         Duplicate Recipe                 |
+------------------------------------------+
| Enter a name for the new recipe:         |
|                                          |
| [Beef Stew (Copy)____________]           |
|                                          |
| This will copy all ingredients and       |
| packaging from "Beef Stew".              |
|                                          |
|              [Cancel]  [Duplicate]       |
+------------------------------------------+
```

### Error State
```
+------------------------------------------+
|         Duplicate Recipe                 |
+------------------------------------------+
| Enter a name for the new recipe:         |
|                                          |
| [Chicken Soup________________]           |
| ⚠ A recipe with this name already exists |
|                                          |
|              [Cancel]  [Duplicate]       |
+------------------------------------------+
```

---

## Technical Notes

- IPC: `recipes:duplicate(id: string, newName: string)`
- Backend handles copying all related entities
- Use database transaction for atomicity

```typescript
// Backend logic
async function duplicateRecipe(id: string, newName: string): Promise<Recipe> {
  return db.transaction(() => {
    const original = getRecipe(id);
    const newRecipe = createRecipe({
      ...original,
      name: newName,
      isFavorite: false,
      isArchived: false
    });

    // Copy ingredients
    for (const ing of original.ingredients) {
      addIngredient(newRecipe.id, { ...ing });
    }

    // Copy packaging
    for (const pkg of original.packaging) {
      addPackaging(newRecipe.id, { ...pkg });
    }

    return newRecipe;
  });
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] All ingredients and packaging copied
- [ ] Atomic transaction (all or nothing)
- [ ] Code reviewed
