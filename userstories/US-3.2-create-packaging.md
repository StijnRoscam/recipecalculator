# US-3.2: Create Packaging Material

## Epic
Epic 3: Packaging Materials Management

## User Story
**As a** user
**I want** to add a new packaging material
**So that** I can include it in recipe costs

## Priority
High (MVP)

## Story Points
3

## Dependencies
- US-3.1: View All Packaging Materials

---

## Acceptance Criteria

### AC-1: Create Page Access
- [ ] "Add Packaging" button navigates to create page
- [ ] URL is clear (e.g., `/packaging/new`)
- [ ] Page title: "New Packaging" or "Add Packaging Material"

### AC-2: Form Fields
- [ ] Name field (required, text input)
- [ ] Unit Price field (required, number input)
- [ ] Unit Type field (required, dropdown)
- [ ] Supplier field (optional, text input)
- [ ] SKU field (optional, text input)
- [ ] Notes field (optional, textarea)

### AC-3: Unit Type Options
- [ ] piece
- [ ] meter
- [ ] roll
- [ ] sheet
- [ ] box
- [ ] bag
- [ ] Default selection: piece

### AC-4: Validation - Name
- [ ] Required - error if empty
- [ ] 1-200 characters
- [ ] Trimmed
- [ ] Unique (case-insensitive)

### AC-5: Validation - Price
- [ ] Required
- [ ] Must be >= 0
- [ ] Accepts decimals

### AC-6: Form Actions
- [ ] Save button submits form
- [ ] Cancel button returns to list without saving
- [ ] Save disabled during submission

### AC-7: Success Behavior
- [ ] Success message on creation
- [ ] Redirect to packaging list
- [ ] New item appears in list

---

## Verification Steps

### Test 1: Navigate to Create
1. Go to Packaging page
2. Click "Add Packaging"
3. **Verify**: Create form loads
4. **Verify**: All fields empty

### Test 2: Required Fields
1. Leave name empty, fill price and unit
2. Click Save
3. **Verify**: Name required error
4. Fill name, clear price
5. **Verify**: Price required error

### Test 3: Successful Creation
1. Enter:
   - Name: "Test Box"
   - Price: 0.50
   - Unit Type: box
   - Supplier: "Box Co"
2. Click Save
3. **Verify**: Success message
4. **Verify**: Redirected to list
5. **Verify**: "Test Box" in list

### Test 4: Duplicate Name
1. Create "Label Roll"
2. Try to create another "Label Roll"
3. **Verify**: Duplicate error
4. Try "label roll" (lowercase)
5. **Verify**: Same error

### Test 5: Unit Type Selection
1. Open Unit Type dropdown
2. **Verify**: All 6 options available
3. Select "meter"
4. Save
5. **Verify**: Unit type saved as "meter"

### Test 6: Cancel
1. Fill form
2. Click Cancel
3. **Verify**: No new item created

---

## UI Mockup Description

```
+--------------------------------------------------+
| < Back to Packaging                               |
+--------------------------------------------------+
| Add Packaging Material                            |
+--------------------------------------------------+
| Name *                                            |
| [________________________]                        |
|                                                   |
| Unit Price (EUR) *                                |
| [_________]                                       |
|                                                   |
| Unit Type *                                       |
| [piece ▼]                                        |
|   - piece                                         |
|   - meter                                         |
|   - roll                                          |
|   - sheet                                         |
|   - box                                           |
|   - bag                                           |
|                                                   |
| Supplier                                          |
| [________________________]                        |
|                                                   |
| SKU                                               |
| [________________________]                        |
|                                                   |
| Notes                                             |
| [________________________]                        |
|                                                   |
|                           [Cancel]  [Save]        |
+--------------------------------------------------+
```

---

## Technical Notes

- IPC: `packaging:create(data: CreatePackagingMaterialInput)`

```typescript
interface CreatePackagingMaterialInput {
  name: string;
  unitPrice: number;
  unitType: 'piece' | 'meter' | 'roll' | 'sheet' | 'box' | 'bag';
  supplier?: string;
  sku?: string;
  notes?: string;
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Form accessible
- [ ] Code reviewed
