# US-4.3: View Recipe Details

## Epic
Epic 4: Recipe Management

## User Story
**As a** user
**I want** to view a recipe's full details and cost breakdown
**So that** I can understand my costs and pricing

## Priority
High (MVP)

## Story Points
8

## Dependencies
- US-4.1: View All Recipes
- US-7.1: View Cost Breakdown

---

## Acceptance Criteria

### AC-1: Detail Page Access
- [ ] Click recipe card navigates to detail page
- [ ] URL: `/recipes/{id}`
- [ ] Page shows recipe name as title

### AC-2: Recipe Metadata Display
- [ ] Name
- [ ] Description
- [ ] Yield (quantity + unit)
- [ ] Prep time
- [ ] Profit margin
- [ ] Waste percentage
- [ ] VAT percentage
- [ ] Instructions
- [ ] Favorite status

### AC-3: Ingredients List
- [ ] All ingredients listed with:
  - Material name
  - Quantity and unit
  - Line cost
  - Percentage of material cost
- [ ] Empty state if no ingredients

### AC-4: Packaging List
- [ ] All packaging listed with:
  - Packaging name
  - Quantity and unit type
  - Line cost
- [ ] Empty state if no packaging

### AC-5: Cost Breakdown Section
- [ ] Material cost (sum of ingredients)
- [ ] Labor cost (prep time × labor rate)
- [ ] Packaging cost (sum of packaging)
- [ ] Total cost
- [ ] Cost per unit (total / yield)

### AC-6: Profit & VAT Section
- [ ] Suggested price (cost + margin)
- [ ] Profit amount
- [ ] VAT amount
- [ ] Final price including VAT

### AC-7: Weight Calculations (if weight-based)
- [ ] Gross weight
- [ ] Waste amount
- [ ] Net weight
- [ ] Cost per kg (gross)
- [ ] Cost per kg (net)

### AC-8: Page Actions
- [ ] Edit button (navigates to edit page)
- [ ] Duplicate button
- [ ] Toggle favorite button
- [ ] Archive button
- [ ] Delete button
- [ ] Back to recipes link

---

## Verification Steps

### Test 1: Navigate to Detail
1. Click recipe from grid
2. **Verify**: Detail page loads
3. **Verify**: Correct recipe shown

### Test 2: Metadata Display
1. Create recipe with all fields filled
2. View detail page
3. **Verify**: All metadata displayed correctly

### Test 3: Ingredients Display
1. Add ingredients: Beef 2kg, Salt 50g
2. View detail page
3. **Verify**: Both ingredients listed
4. **Verify**: Quantities correct
5. **Verify**: Line costs calculated

### Test 4: Cost Calculations
1. Recipe with:
   - Beef 2kg @ €25/kg = €50
   - Salt 50g @ €1/kg = €0.05
   - Prep time 60min @ €25/hour = €25
   - Vacuum bag x2 @ €0.15 = €0.30
2. View costs
3. **Verify**: Material cost = €50.05
4. **Verify**: Labor cost = €25.00
5. **Verify**: Packaging cost = €0.30
6. **Verify**: Total = €75.35

### Test 5: Cost Per Unit
1. Recipe yields 4 portions
2. Total cost €75.35
3. **Verify**: Cost per unit = €18.84 (rounded)

### Test 6: Profit Calculations
1. Set profit margin to 25%
2. Total cost €75.35
3. **Verify**: Suggested price = €94.19
4. **Verify**: Profit = €18.84

### Test 7: VAT Calculations
1. Set VAT 21%
2. Suggested price €94.19
3. **Verify**: VAT amount = €19.78
4. **Verify**: Price incl VAT = €113.97

### Test 8: Weight Calculations
1. Recipe with yield in kg
2. Total ingredients: 2.5kg
3. Waste 10%
4. **Verify**: Gross weight = 2.5kg
5. **Verify**: Waste = 0.25kg
6. **Verify**: Net weight = 2.25kg
7. **Verify**: Cost per kg shown

### Test 9: Empty Ingredients
1. View recipe with no ingredients
2. **Verify**: "No ingredients" message
3. **Verify**: Material cost = €0

### Test 10: Edit Navigation
1. Click Edit button
2. **Verify**: Navigates to edit page

---

## UI Mockup Description

```
+------------------------------------------------------------------+
| < Back to Recipes                    [★][Edit][Duplicate][Delete] |
+------------------------------------------------------------------+
| Beef Stew                                                         |
+------------------------------------------------------------------+
| A hearty stew with tender beef and vegetables                     |
|                                                                   |
| Yield: 4 portions | Prep Time: 60 min                             |
| Profit Margin: 25% | Waste: 5% | VAT: 21%                         |
+------------------------------------------------------------------+
|                                                                   |
| INGREDIENTS                                                       |
| +--------------------------------------------------------------+ |
| | Material      | Qty    | Unit | Cost    | % of Materials     | |
| |---------------|--------|------|---------|--------------------| |
| | Beef Chuck    | 2      | kg   | €50.00  | 83%                | |
| | Onions        | 0.5    | kg   | €1.00   | 2%                 | |
| | Carrots       | 0.3    | kg   | €0.60   | 1%                 | |
| +--------------------------------------------------------------+ |
|                                                                   |
| PACKAGING                                                         |
| +--------------------------------------------------------------+ |
| | Packaging     | Qty    | Unit  | Cost                        | |
| |---------------|--------|-------|-----------------------------| |
| | Container     | 4      | piece | €2.00                       | |
| +--------------------------------------------------------------+ |
|                                                                   |
| COST BREAKDOWN                                                    |
| +--------------------------------------------------------------+ |
| | Material Cost:     €51.60                                     | |
| | Labor Cost:        €25.00 (60 min @ €25/hr)                   | |
| | Packaging Cost:    €2.00                                      | |
| |--------------------------------------------------------------|  |
| | Total Cost:        €78.60                                     | |
| | Cost per Unit:     €19.65                                     | |
| +--------------------------------------------------------------+ |
|                                                                   |
| PRICING                                                           |
| +--------------------------------------------------------------+ |
| | Suggested Price:   €98.25 (25% margin)                        | |
| | Profit:            €19.65                                     | |
| | VAT (21%):         €20.63                                     | |
| | Price incl. VAT:   €118.88                                    | |
| +--------------------------------------------------------------+ |
|                                                                   |
| INSTRUCTIONS                                                      |
| +--------------------------------------------------------------+ |
| | 1. Cut beef into cubes                                        | |
| | 2. Sear in hot pan                                            | |
| | 3. Add vegetables and broth                                   | |
| | 4. Simmer for 2 hours                                         | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## Technical Notes

- IPC: `recipes:get(id)` returns `RecipeWithDetails`
- IPC: `pricing:calculate(id)` returns full pricing breakdown
- Combine calls or use single comprehensive call

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] All calculations accurate
- [ ] Currency formatting consistent
- [ ] Code reviewed
