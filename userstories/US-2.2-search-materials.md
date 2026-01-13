# US-2.2: Search Materials

## Epic
Epic 2: Source Materials Management

## User Story
**As a** user
**I want** to search materials by name
**So that** I can quickly find specific ingredients

## Priority
High (MVP)

## Story Points
2

## Dependencies
- US-2.1: View All Materials

---

## Acceptance Criteria

### AC-1: Search Input
- [ ] Search input field is visible on materials page
- [ ] Placeholder text indicates purpose (e.g., "Search materials...")
- [ ] Search icon is displayed in or near the input

### AC-2: Search Behavior
- [ ] Search filters materials as user types
- [ ] Search is debounced (300ms delay)
- [ ] Search is case-insensitive
- [ ] Search matches partial names (contains)

### AC-3: Results Display
- [ ] Matching materials are displayed in the list
- [ ] Non-matching materials are hidden
- [ ] Result count is indicated (optional but helpful)

### AC-4: No Results State
- [ ] When no materials match, show "No materials found" message
- [ ] "Add Material" button remains accessible

### AC-5: Clear Search
- [ ] Clear/reset button appears when search has text
- [ ] Clicking clear resets to show all materials
- [ ] Pressing Escape clears the search

### AC-6: Search Persistence
- [ ] Search term persists while on materials page
- [ ] Navigating away and back clears the search (or optionally preserves it)

---

## Verification Steps

### Test 1: Search Input Present
1. Navigate to Materials page
2. **Verify**: Search input is visible
3. **Verify**: Placeholder text is present

### Test 2: Case-Insensitive Search
1. Create materials: "Beef", "Pork Belly", "Chicken Breast"
2. Type "beef" (lowercase)
3. **Verify**: "Beef" is shown
4. Type "BEEF" (uppercase)
5. **Verify**: "Beef" is still shown

### Test 3: Partial Match
1. Type "pork"
2. **Verify**: "Pork Belly" is shown
3. Type "belly"
4. **Verify**: "Pork Belly" is shown
5. Type "ork bell"
6. **Verify**: "Pork Belly" is shown

### Test 4: Debounce Behavior
1. Open browser developer tools, Network tab
2. Type "chicken" quickly
3. **Verify**: Only one search request made (after typing stops)
4. **Verify**: Intermediate states don't trigger searches

### Test 5: No Results
1. Type "xyznotfound"
2. **Verify**: "No materials found" message appears
3. **Verify**: Materials list is empty
4. **Verify**: "Add Material" button is still visible

### Test 6: Clear Search
1. Type "beef" in search
2. Click clear button (X)
3. **Verify**: Search input is empty
4. **Verify**: All materials are shown again

### Test 7: Escape to Clear
1. Type "pork" in search
2. Press Escape key
3. **Verify**: Search input is cleared
4. **Verify**: All materials are shown

### Test 8: Search with Archived Filter
1. Have some archived materials
2. Enable "Show Archived" filter
3. Search for an archived material name
4. **Verify**: Archived material appears in results
5. Disable "Show Archived" filter
6. **Verify**: Archived material no longer in results

### Test 9: Real-time Updates
1. Type "chi"
2. **Verify**: "Chicken Breast" appears
3. Continue typing "cken"
4. **Verify**: "Chicken Breast" still appears
5. Continue typing "z"
6. **Verify**: No results (nothing matches "chickenz")

---

## Technical Notes

- Use `useMemo` or `useCallback` for debounced search
- Consider using `lodash.debounce` or custom hook
- Search can be client-side filtering for small datasets
- For large datasets, use IPC: `materials:search(query: string)`

```typescript
// Debounce hook example
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  // Filter or fetch based on debouncedSearch
}, [debouncedSearch]);
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Debounce working correctly (300ms)
- [ ] Accessible (keyboard navigation works)
- [ ] Code reviewed
