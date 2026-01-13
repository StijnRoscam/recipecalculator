# US-3.3: Edit Packaging Material

## Epic
Epic 3: Packaging Materials Management

## User Story
**As a** user
**I want** to update packaging material details
**So that** costs remain accurate

## Priority
High (MVP)

## Story Points
2

## Dependencies
- US-3.1: View All Packaging Materials
- US-3.2: Create Packaging Material (shares form)

---

## Acceptance Criteria

### AC-1: Edit Page Access
- [ ] Edit action navigates to edit page
- [ ] URL contains ID (e.g., `/packaging/{id}`)
- [ ] Page title: "Edit Packaging Material"

### AC-2: Form Pre-population
- [ ] All fields populated with current values
- [ ] Empty optional fields show as empty

### AC-3: Validation
- [ ] Same rules as create
- [ ] Name uniqueness excludes current item
- [ ] Can save with unchanged name

### AC-4: Success Behavior
- [ ] Success message on update
- [ ] Redirect to packaging list
- [ ] Changes reflected in list

### AC-5: Error Handling
- [ ] 404 if ID doesn't exist
- [ ] Validation errors inline

### AC-6: Recipe Cost Impact
- [ ] Updated prices affect recipe cost calculations
- [ ] Changes take effect immediately

---

## Verification Steps

### Test 1: Navigate to Edit
1. Click edit on "Vacuum Bag"
2. **Verify**: Edit page loads
3. **Verify**: Form shows current values

### Test 2: Update Price
1. Change price from €0.15 to €0.20
2. Save
3. **Verify**: List shows €0.20

### Test 3: Recipe Cost Update
1. Create recipe using "Vacuum Bag" (qty: 10)
2. Note total packaging cost (€1.50 at €0.15)
3. Edit "Vacuum Bag" price to €0.25
4. View recipe
5. **Verify**: Packaging cost now €2.50

### Test 4: Keep Same Name
1. Edit item
2. Change only price, keep name
3. Save
4. **Verify**: No duplicate error

### Test 5: Duplicate Name Error
1. Have "Box A" and "Box B"
2. Edit "Box A"
3. Change name to "Box B"
4. **Verify**: Duplicate error

### Test 6: Cancel
1. Edit item
2. Change values
3. Click Cancel
4. **Verify**: Original values preserved

### Test 7: Invalid ID
1. Navigate to `/packaging/fake-uuid`
2. **Verify**: Not found error

---

## Technical Notes

- IPC: `packaging:get(id)`, `packaging:update(id, data)`
- Share form component with create page

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Recipe costs update after price changes
- [ ] Code reviewed
