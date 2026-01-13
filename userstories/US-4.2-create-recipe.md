# US-4.2: Create Recipe

## Epic
Epic 4: Recipe Management

## User Story
**As a** user
**I want** to create a new recipe
**So that** I can calculate its costs

## Priority
High (MVP)

## Story Points
5

## Dependencies
- US-4.1: View All Recipes

---

## Acceptance Criteria

### AC-1: Create Page Access
- [ ] "Create Recipe" button navigates to form
- [ ] URL: `/recipes/new`
- [ ] Page title: "New Recipe" or "Create Recipe"

### AC-2: Form Fields
- [ ] Name (required, text)
- [ ] Description (optional, textarea)
- [ ] Yield Quantity (required, number)
- [ ] Yield Unit (required, dropdown: portion, piece, kg, g, l, ml)
- [ ] Prep Time Minutes (optional, number)
- [ ] Profit Margin % (optional, number 0-100)
- [ ] Waste Percentage % (optional, number 0-100)
- [ ] VAT Percentage % (optional, number - typically 0, 6, 9, 21)
- [ ] Instructions (optional, textarea)

### AC-3: Validation - Name
- [ ] Required
- [ ] 1-200 characters
- [ ] Unique (case-insensitive)
- [ ] Trimmed

### AC-4: Validation - Yield Quantity
- [ ] Required
- [ ] Must be > 0
- [ ] Must be finite number

### AC-5: Validation - Percentages
- [ ] Profit margin: 0-100 if provided
- [ ] Waste percentage: 0-100 if provided
- [ ] VAT percentage: 0-100 if provided

### AC-6: Default Values
- [ ] Yield Unit: portion
- [ ] VAT: Use default from settings

### AC-7: Success Behavior
- [ ] Success message
- [ ] Redirect to recipe edit page (to add ingredients)
- [ ] Or redirect to recipe detail page

---

## Verification Steps

### Test 1: Navigate to Create
1. Click "Create Recipe"
2. **Verify**: Form loads empty
3. **Verify**: Yield Unit defaults to "portion"

### Test 2: Required Fields
1. Leave name empty
2. Click Save
3. **Verify**: Name required error

### Test 3: Yield Validation
1. Enter yield quantity: 0
2. **Verify**: Error "must be greater than 0"
3. Enter yield quantity: -5
4. **Verify**: Error

### Test 4: Percentage Validation
1. Enter profit margin: 150
2. **Verify**: Error "must be between 0 and 100"
3. Enter profit margin: -10
4. **Verify**: Error

### Test 5: Successful Creation
1. Enter:
   - Name: "Test Recipe"
   - Yield: 4 portions
   - Prep Time: 30
   - Profit Margin: 25
2. Save
3. **Verify**: Success message
4. **Verify**: Recipe created
5. **Verify**: Redirected to edit or detail page

### Test 6: Duplicate Name
1. Create "My Soup"
2. Try to create another "My Soup"
3. **Verify**: Duplicate error

### Test 7: Default VAT
1. Set default VAT to 9% in settings
2. Create new recipe
3. **Verify**: VAT field shows 9 (or defaults on save)

### Test 8: All Optional Fields Empty
1. Fill only name and yield
2. Save
3. **Verify**: Recipe created successfully
4. **Verify**: Optional fields are null/empty

---

## UI Mockup Description

```
+--------------------------------------------------+
| < Back to Recipes                                 |
+--------------------------------------------------+
| Create Recipe                                     |
+--------------------------------------------------+
| Name *                                            |
| [________________________]                        |
|                                                   |
| Description                                       |
| [________________________]                        |
| [________________________]                        |
|                                                   |
| Yield Quantity *        Yield Unit *              |
| [_________]            [portion ▼]               |
|                                                   |
| Prep Time (minutes)                               |
| [_________]                                       |
|                                                   |
| Profit Margin (%)       Waste (%)                 |
| [_________]            [_________]               |
|                                                   |
| VAT (%)                                           |
| [_________]                                       |
|                                                   |
| Instructions                                      |
| [________________________]                        |
| [________________________]                        |
| [________________________]                        |
|                                                   |
|                           [Cancel]  [Save]        |
+--------------------------------------------------+
```

---

## Technical Notes

- IPC: `recipes:create(data: CreateRecipeInput)`
- Fetch default VAT on form load: `settings:get('default_vat_rate')`

```typescript
interface CreateRecipeInput {
  name: string;
  description?: string;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes?: number;
  profitMargin?: number;
  wastePercentage?: number;
  vatPercentage?: number;
  instructions?: string;
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Form validates all fields
- [ ] Default VAT from settings applied
- [ ] Code reviewed
