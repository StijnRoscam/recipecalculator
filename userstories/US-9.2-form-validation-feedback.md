# US-9.2: Form Validation Feedback

## Epic
Epic 9: Navigation & UX

## User Story
**As a** user
**I want** immediate feedback on form errors
**So that** I can correct mistakes before submitting

## Priority
Medium

## Story Points
3

## Dependencies
- All form-related stories (US-2.3, US-3.2, US-4.2, etc.)

---

## Acceptance Criteria

### AC-1: Inline Error Messages
- [ ] Errors shown below/beside the relevant field
- [ ] Clear error text in red
- [ ] Icon indicating error (optional)

### AC-2: Field Highlighting
- [ ] Invalid fields have red border
- [ ] Valid fields have normal or green border
- [ ] Focus returns to first invalid field

### AC-3: Error Timing
- [ ] Show on blur (leaving field)
- [ ] Show on submit attempt
- [ ] Clear when corrected

### AC-4: Error Messages
- [ ] Clear, actionable text
- [ ] Translated (via i18n)
- [ ] Specific to the error type

### AC-5: Form-Level Errors
- [ ] Server errors shown at top of form
- [ ] Or near relevant field if identifiable

---

## Verification Steps

### Test 1: Required Field Error
1. Focus on required field
2. Leave it empty
3. Blur (click away)
4. **Verify**: Error message appears
5. **Verify**: Red border on field

### Test 2: Error on Submit
1. Leave required fields empty
2. Click Submit
3. **Verify**: All errors shown
4. **Verify**: Focus moves to first error

### Test 3: Clear on Correction
1. Field shows error
2. Enter valid value
3. **Verify**: Error disappears
4. **Verify**: Border returns to normal

### Test 4: Specific Error Messages
1. Price field: enter -5
2. **Verify**: "Price must be 0 or greater"
3. Name field: enter existing name
4. **Verify**: "Name already exists"

### Test 5: Translated Errors
1. Switch to Dutch
2. Trigger validation error
3. **Verify**: Error in Dutch

---

## UI Mockup Description

```
Normal field:
+--------------------------------------------------+
| Name *                                            |
| [________________________]                        |
+--------------------------------------------------+

Field with error:
+--------------------------------------------------+
| Name *                                            |
| [________________________]  <- red border         |
| ⚠ Name is required                               |
+--------------------------------------------------+

Field corrected:
+--------------------------------------------------+
| Name *                                            |
| [Beef Tenderloin__________]  <- normal/green     |
+--------------------------------------------------+
```

---

## Technical Notes

- Use react-hook-form with zod for validation
- Consistent error styling via TailwindCSS

```tsx
<input
  className={errors.name ? 'border-red-500' : 'border-gray-300'}
  {...register('name')}
/>
{errors.name && (
  <span className="text-red-500 text-sm">{errors.name.message}</span>
)}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Consistent across all forms
- [ ] Errors are translated
- [ ] Code reviewed
