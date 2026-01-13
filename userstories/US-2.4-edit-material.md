# US-2.4: Edit Material

## Epic
Epic 2: Source Materials Management

## User Story
**As a** user
**I want** to update material information
**So that** I can keep prices and details current

## Priority
High (MVP)

## Story Points
3

## Dependencies
- US-2.1: View All Materials
- US-2.3: Create Material (shares form component)

---

## Acceptance Criteria

### AC-1: Edit Page Access
- [ ] Edit action from materials list navigates to edit page
- [ ] URL contains material ID (e.g., `/materials/{id}`)
- [ ] Page title indicates editing (e.g., "Edit Material")

### AC-2: Form Pre-population
- [ ] Form loads with current material values
- [ ] All fields are populated (name, price, unit, supplier, SKU, notes)
- [ ] Empty optional fields show as empty (not "null")

### AC-3: Form Fields
- [ ] Same fields as create: name, price, unit, supplier, SKU, notes
- [ ] All fields are editable

### AC-4: Validation
- [ ] Same validation rules as create material
- [ ] Name uniqueness check excludes current material
- [ ] Can save with same name (no false duplicate error)

### AC-5: Form Actions
- [ ] "Save" button submits changes
- [ ] "Cancel" button returns to materials list without saving
- [ ] Changes are not saved until Save is clicked

### AC-6: Success Behavior
- [ ] Success message/notification on update
- [ ] Redirect to materials list after update
- [ ] Updated values appear in the list

### AC-7: Error Handling
- [ ] 404 error if material ID doesn't exist
- [ ] Clear error message for not found
- [ ] Validation errors shown inline

### AC-8: Loading State
- [ ] Loading indicator while fetching material data
- [ ] Loading indicator while saving

---

## Verification Steps

### Test 1: Navigate to Edit Page
1. Create material "Beef" with price 25.00
2. From materials list, click edit on "Beef"
3. **Verify**: Edit page loads
4. **Verify**: URL contains the material ID
5. **Verify**: Form shows "Beef" in name, 25.00 in price

### Test 2: All Fields Pre-populated
1. Create material with all fields filled:
   - Name: "Full Material"
   - Price: 15.50
   - Unit: g
   - Supplier: "Supplier X"
   - SKU: "SKU-001"
   - Notes: "Test notes"
2. Navigate to edit page
3. **Verify**: All fields show correct values

### Test 3: Update Name
1. Edit "Beef" material
2. Change name to "Premium Beef"
3. Click Save
4. **Verify**: Success message
5. **Verify**: Materials list shows "Premium Beef"
6. **Verify**: "Beef" no longer exists

### Test 4: Update Price
1. Edit a material
2. Change price from 25.00 to 30.00
3. Click Save
4. **Verify**: Price updated in list

### Test 5: Keep Same Name
1. Edit "Premium Beef"
2. Don't change the name
3. Change price to 35.00
4. Click Save
5. **Verify**: No duplicate name error
6. **Verify**: Update succeeds

### Test 6: Duplicate Name with Another Material
1. Create "Chicken" material
2. Edit "Premium Beef"
3. Change name to "Chicken"
4. Click Save
5. **Verify**: Error "A material with this name already exists"

### Test 7: Cancel Without Saving
1. Edit a material
2. Change several fields
3. Click Cancel
4. **Verify**: Returned to materials list
5. **Verify**: Original values are preserved (not changed)

### Test 8: Invalid Material ID
1. Navigate to `/materials/non-existent-uuid`
2. **Verify**: Error message "Material not found"
3. **Verify**: Option to return to materials list

### Test 9: Update Optional Fields
1. Edit material with empty supplier
2. Add supplier "New Supplier"
3. Save
4. **Verify**: Supplier is saved
5. Edit again
6. Clear supplier field
7. Save
8. **Verify**: Supplier is now empty

### Test 10: Loading State
1. Navigate to edit page
2. **Verify**: Loading indicator appears briefly
3. **Verify**: Form appears once loaded

---

## UI Mockup Description

```
+--------------------------------------------------+
| < Back to Materials                               |
+--------------------------------------------------+
| Edit Material                                     |
+--------------------------------------------------+
| Name *                                            |
| [Beef Tenderloin_________]                        |
|                                                   |
| Current Price (EUR) *                             |
| [25.00____]                                       |
|                                                   |
| Unit of Measure *                                 |
| [kg ▼]                                           |
|                                                   |
| Supplier                                          |
| [Premium Meats___________]                        |
|                                                   |
| SKU                                               |
| [BEEF-TEND-001___________]                        |
|                                                   |
| Notes                                             |
| [High quality tenderloin_]                        |
|                                                   |
|                           [Cancel]  [Save]        |
+--------------------------------------------------+
```

---

## Technical Notes

- Use URL parameter to get material ID: `useParams()`
- Fetch material on component mount: `materials:get(id: string)`
- Update material: `materials:update(id: string, data: UpdateMaterialInput)`
- Share form component with create page, pass mode prop

```typescript
interface UpdateMaterialInput {
  name?: string;
  currentPrice?: number;
  unitOfMeasure?: 'kg' | 'g';
  supplier?: string | null;
  sku?: string | null;
  notes?: string | null;
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Form component reused from create
- [ ] Proper error handling for missing material
- [ ] Code reviewed
