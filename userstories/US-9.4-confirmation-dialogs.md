# US-9.4: Confirmation Dialogs

## Epic
Epic 9: Navigation & UX

## User Story
**As a** user
**I want** confirmation before destructive actions
**So that** I don't accidentally delete data

## Priority
Medium

## Story Points
2

## Dependencies
- US-2.5: Delete Material
- US-4.7: Delete Recipe

---

## Acceptance Criteria

### AC-1: Dialog Trigger
- [ ] Delete actions trigger confirmation
- [ ] Other destructive actions as needed

### AC-2: Dialog Content
- [ ] Clear title (e.g., "Delete Material")
- [ ] Description of what will be deleted
- [ ] Name of item being deleted
- [ ] Warning about permanence

### AC-3: Dialog Actions
- [ ] Cancel button (secondary style)
- [ ] Confirm button (danger style, red)
- [ ] Cancel is default focus

### AC-4: Keyboard Support
- [ ] Escape key closes dialog
- [ ] Tab navigates between buttons
- [ ] Enter activates focused button

### AC-5: Backdrop
- [ ] Dark overlay behind dialog
- [ ] Click outside closes dialog (cancel)

### AC-6: Accessibility
- [ ] Focus trapped in dialog
- [ ] Screen reader announcements
- [ ] Proper ARIA attributes

---

## Verification Steps

### Test 1: Dialog Appears
1. Click Delete on an item
2. **Verify**: Dialog appears
3. **Verify**: Backdrop visible

### Test 2: Dialog Content
1. Open delete dialog for "Beef"
2. **Verify**: Title says "Delete Material"
3. **Verify**: "Beef" is mentioned
4. **Verify**: Warning about permanence

### Test 3: Cancel Button
1. Open dialog
2. Click Cancel
3. **Verify**: Dialog closes
4. **Verify**: Item not deleted

### Test 4: Confirm Button
1. Open dialog
2. Click Delete/Confirm
3. **Verify**: Action performed
4. **Verify**: Dialog closes

### Test 5: Escape Key
1. Open dialog
2. Press Escape
3. **Verify**: Dialog closes
4. **Verify**: Item not deleted

### Test 6: Click Outside
1. Open dialog
2. Click on backdrop
3. **Verify**: Dialog closes

### Test 7: Focus Trap
1. Open dialog
2. Press Tab repeatedly
3. **Verify**: Focus stays within dialog
4. **Verify**: Focus cycles between Cancel/Delete

---

## UI Mockup Description

```
Backdrop (semi-transparent)
+------------------------------------------------------------------+
|                                                                   |
|       +------------------------------------------+                |
|       |          Delete Material                 |                |
|       +------------------------------------------+                |
|       |                                          |                |
|       | Are you sure you want to delete          |                |
|       | "Beef Tenderloin"?                       |                |
|       |                                          |                |
|       | This action cannot be undone.            |                |
|       |                                          |                |
|       |              [Cancel]  [Delete]          |                |
|       +------------------------------------------+                |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Technical Notes

- Create reusable ConfirmDialog component
- Use React Portal for rendering
- Use focus-trap-react or similar for focus management

```tsx
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Material"
  description={`Are you sure you want to delete "${material.name}"?`}
  confirmText="Delete"
  confirmVariant="danger"
/>
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Keyboard navigation works
- [ ] Accessible (screen reader tested)
- [ ] Reusable component
- [ ] Code reviewed
