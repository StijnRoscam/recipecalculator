# US-9.3: Loading States

## Epic
Epic 9: Navigation & UX

## User Story
**As a** user
**I want** to see loading indicators during operations
**So that** I know the app is working

## Priority
Medium

## Story Points
2

## Dependencies
- All data-fetching stories

---

## Acceptance Criteria

### AC-1: Page Loading
- [ ] Loading spinner when page data is fetching
- [ ] Replaces or overlays content area
- [ ] Appears within 200ms if loading takes longer

### AC-2: Button Loading
- [ ] Submit buttons show loading state
- [ ] Button disabled during loading
- [ ] Spinner or text change ("Saving...")

### AC-3: List Loading
- [ ] Loading state when fetching lists
- [ ] Skeleton or spinner

### AC-4: Action Loading
- [ ] Loading indicator for delete, archive, etc.
- [ ] Prevents double-clicks

---

## Verification Steps

### Test 1: Page Load
1. Navigate to Materials page
2. **Verify**: Loading spinner appears briefly
3. **Verify**: Content appears when loaded

### Test 2: Form Submit
1. Fill form and click Save
2. **Verify**: Button shows loading state
3. **Verify**: Button is disabled
4. **Verify**: Normal state after complete

### Test 3: Delete Action
1. Click Delete
2. Confirm
3. **Verify**: Loading indicator during deletion
4. **Verify**: Item removed when complete

### Test 4: Slow Connection (simulated)
1. Throttle network to slow 3G
2. Navigate to Recipes
3. **Verify**: Loading state visible for duration
4. **Verify**: Content eventually appears

---

## UI Mockup Description

```
Page loading:
+--------------------------------------------------+
| Materials                                         |
+--------------------------------------------------+
|                                                   |
|                    [Spinner]                      |
|                   Loading...                      |
|                                                   |
+--------------------------------------------------+

Button loading:
+--------------------------------------------------+
|                    [Cancel]  [⟳ Saving...]       |
+--------------------------------------------------+

Skeleton loading (alternative):
+--------------------------------------------------+
| Materials                                         |
+--------------------------------------------------+
| [░░░░░░░░░░░░░░░░] | [░░░░░] | [░░░] | [░░░░░░] |
| [░░░░░░░░░░░░░░░░] | [░░░░░] | [░░░] | [░░░░░░] |
| [░░░░░░░░░░░░░░░░] | [░░░░░] | [░░░] | [░░░░░░] |
+--------------------------------------------------+
```

---

## Technical Notes

- Create reusable Spinner component
- Use React state for loading flags
- Consider React Suspense for data loading

```tsx
const [isLoading, setIsLoading] = useState(true);

return isLoading ? <Spinner /> : <Content />;
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Consistent loading UI
- [ ] Code reviewed
