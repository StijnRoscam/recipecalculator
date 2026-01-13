# US-2.3: Create Material

## Epic
Epic 2: Source Materials Management

## User Story
**As a** user
**I want** to add a new source material
**So that** I can use it in my recipes

## Priority
High (MVP)

## Story Points
5

## Dependencies
- US-2.1: View All Materials (for navigation back)

---

## Acceptance Criteria

### AC-1: Create Page Access
- [ ] "Add Material" button on materials list navigates to create page
- [ ] URL is clear (e.g., `/materials/new`)
- [ ] Page has clear title "New Material" or "Add Material"

### AC-2: Form Fields
- [ ] Name field (required, text input)
- [ ] Current Price field (required, number input)
- [ ] Unit of Measure field (required, dropdown: kg, g)
- [ ] Supplier field (optional, text input)
- [ ] SKU field (optional, text input)
- [ ] Notes field (optional, textarea)

### AC-3: Form Validation - Name
- [ ] Name is required - error shown if empty
- [ ] Name must be 1-200 characters
- [ ] Name is trimmed (leading/trailing spaces removed)
- [ ] Name must be unique (case-insensitive)
- [ ] Duplicate name error is clear and specific

### AC-4: Form Validation - Price
- [ ] Price is required
- [ ] Price must be a number
- [ ] Price must be >= 0
- [ ] Price accepts decimal values (e.g., 12.50)

### AC-5: Form Validation - Unit
- [ ] Unit is required
- [ ] Only "kg" or "g" allowed
- [ ] Default selection: kg

### AC-6: Form Actions
- [ ] "Save" button submits the form
- [ ] "Cancel" button returns to materials list without saving
- [ ] Save button is disabled while submitting

### AC-7: Success Behavior
- [ ] Success message/notification on creation
- [ ] Redirect to materials list after creation
- [ ] New material appears in the list

### AC-8: Error Handling
- [ ] Validation errors shown inline next to fields
- [ ] Server errors shown as notification/alert
- [ ] Form remains editable after error

---

## Verification Steps

### Test 1: Navigate to Create Page
1. Go to Materials page
2. Click "Add Material" button
3. **Verify**: Create page loads
4. **Verify**: Form is empty
5. **Verify**: URL is `/materials/new` or similar

### Test 2: Required Field - Name
1. Leave name empty
2. Fill other required fields
3. Click Save
4. **Verify**: Error message appears for name field
5. **Verify**: Form is not submitted

### Test 3: Required Field - Price
1. Fill name
2. Leave price empty
3. Click Save
4. **Verify**: Error message appears for price field

### Test 4: Invalid Price - Negative
1. Enter -5 in price field
2. Click Save
3. **Verify**: Error message "Price must be 0 or greater"

### Test 5: Successful Creation
1. Enter:
   - Name: "Test Beef"
   - Price: 25.50
   - Unit: kg
   - Supplier: "Test Supplier"
2. Click Save
3. **Verify**: Success message appears
4. **Verify**: Redirected to materials list
5. **Verify**: "Test Beef" appears in the list with correct values

### Test 6: Duplicate Name
1. Create material "Pork"
2. Go to create new material
3. Enter name "Pork" (exact match)
4. Fill other fields
5. Click Save
6. **Verify**: Error "A material with this name already exists"

### Test 7: Duplicate Name - Case Insensitive
1. With "Pork" existing
2. Try to create "pork" (lowercase)
3. **Verify**: Same duplicate error appears
4. Try to create "PORK" (uppercase)
5. **Verify**: Same duplicate error appears

### Test 8: Name Trimming
1. Enter name "  Chicken  " (with spaces)
2. Save
3. **Verify**: Material is created as "Chicken" (trimmed)

### Test 9: Cancel Button
1. Fill in some form data
2. Click Cancel
3. **Verify**: Returned to materials list
4. **Verify**: No new material was created

### Test 10: Decimal Price
1. Enter price "12.999"
2. Save
3. **Verify**: Price is stored correctly (may round to 13.00 or store as-is)

### Test 11: Optional Fields Empty
1. Fill only required fields (name, price, unit)
2. Leave supplier, SKU, notes empty
3. Click Save
4. **Verify**: Material is created successfully
5. **Verify**: Optional fields show as empty/null

### Test 12: Maximum Name Length
1. Enter a name with 201 characters
2. Click Save
3. **Verify**: Error "Name must be 200 characters or less"

---

## UI Mockup Description

```
+--------------------------------------------------+
| < Back to Materials                               |
+--------------------------------------------------+
| Add Material                                      |
+--------------------------------------------------+
| Name *                                            |
| [________________________]                        |
|                                                   |
| Current Price (EUR) *                             |
| [_________]                                       |
|                                                   |
| Unit of Measure *                                 |
| [kg ▼]                                           |
|                                                   |
| Supplier                                          |
| [________________________]                        |
|                                                   |
| SKU                                               |
| [________________________]                        |
|                                                   |
| Notes                                             |
| [________________________]                        |
| [________________________]                        |
|                                                   |
|                           [Cancel]  [Save]        |
+--------------------------------------------------+
```

---

## Technical Notes

- Use form validation library (react-hook-form + zod recommended)
- IPC call: `materials:create(data: CreateMaterialInput)`
- Handle unique constraint error from database

```typescript
interface CreateMaterialInput {
  name: string;
  currentPrice: number;
  unitOfMeasure: 'kg' | 'g';
  supplier?: string;
  sku?: string;
  notes?: string;
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Form is accessible (labels, focus management)
- [ ] Loading state during submission
- [ ] Code reviewed
