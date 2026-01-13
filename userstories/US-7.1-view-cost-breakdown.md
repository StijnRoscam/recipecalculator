# US-7.1: View Cost Breakdown

## Epic
Epic 7: Pricing & Cost Calculation

## User Story
**As a** user
**I want** to see a detailed cost breakdown for a recipe
**So that** I understand where my costs come from

## Priority
High (MVP)

## Story Points
5

## Dependencies
- US-4.3: View Recipe Details
- US-8.1: Configure Labor Rate

---

## Acceptance Criteria

### AC-1: Cost Breakdown Section
- [ ] Visible on recipe detail page
- [ ] Clear, readable layout
- [ ] All costs in EUR with 2 decimal places

### AC-2: Material Cost
- [ ] Total material cost displayed
- [ ] Per-ingredient breakdown available
- [ ] Each ingredient shows: name, qty, unit, line cost, percentage

### AC-3: Labor Cost
- [ ] Labor cost displayed
- [ ] Based on prep time × labor rate
- [ ] Shows calculation: "X min @ €Y/hr = €Z"

### AC-4: Packaging Cost
- [ ] Total packaging cost displayed
- [ ] Per-item breakdown available

### AC-5: Total Cost
- [ ] Sum of material + labor + packaging
- [ ] Prominently displayed

### AC-6: Cost Per Unit
- [ ] Total cost ÷ yield quantity
- [ ] Shows unit (per portion, per kg, etc.)

---

## Verification Steps

### Test 1: Material Cost Calculation
1. Recipe with:
   - Beef 2kg @ €25/kg
   - Salt 100g @ €1/kg
2. **Verify**: Material cost = €50.10
3. **Verify**: Beef shows €50.00 (99.8%)
4. **Verify**: Salt shows €0.10 (0.2%)

### Test 2: Labor Cost Calculation
1. Prep time: 30 minutes
2. Labor rate: €25/hour
3. **Verify**: Labor cost = €12.50
4. **Verify**: Shows "30 min @ €25/hr"

### Test 3: Packaging Cost
1. 4 containers @ €0.50 = €2.00
2. **Verify**: Packaging cost = €2.00

### Test 4: Total Cost
1. Materials: €50.10
2. Labor: €12.50
3. Packaging: €2.00
4. **Verify**: Total = €64.60

### Test 5: Cost Per Unit
1. Total: €64.60
2. Yield: 4 portions
3. **Verify**: Cost per portion = €16.15

### Test 6: No Prep Time
1. Recipe without prep time
2. **Verify**: Labor cost = €0
3. **Verify**: Or shows "N/A"

### Test 7: No Packaging
1. Recipe without packaging
2. **Verify**: Packaging cost = €0

### Test 8: Unit Conversion in Cost
1. Material: €10/kg
2. Ingredient: 500g
3. **Verify**: Line cost = €5.00

---

## UI Mockup Description

```
COST BREAKDOWN
+------------------------------------------------------------------+
| MATERIALS                                              €51.60     |
| +--------------------------------------------------------------+ |
| | Beef Chuck (2 kg @ €25.00/kg)              €50.00     96.9%  | |
| | Salt (100g @ €1.00/kg)                     €0.10      0.2%   | |
| | Carrots (0.5 kg @ €3.00/kg)                €1.50      2.9%   | |
| +--------------------------------------------------------------+ |
|                                                                   |
| LABOR                                                  €12.50     |
| 30 minutes @ €25.00/hour                                          |
|                                                                   |
| PACKAGING                                              €2.00      |
| +--------------------------------------------------------------+ |
| | Container (4 × €0.50)                      €2.00              | |
| +--------------------------------------------------------------+ |
|                                                                   |
+===================================================================+
| TOTAL COST                                             €66.10     |
| Cost per portion (yield: 4)                            €16.53     |
+===================================================================+
```

---

## Technical Notes

- All calculations in backend for consistency
- Use Decimal/precise math, not floating point
- IPC: `pricing:calculate(recipeId)` returns full breakdown

```typescript
interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  packagingCost: number;
  totalCost: number;
  costPerUnit: number;
  ingredients: IngredientCost[];
  packagingItems: PackagingCost[];
  prepTimeMinutes: number | null;
  laborRatePerHour: number;
  yieldQuantity: number;
  yieldUnit: string;
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Calculations match expected values
- [ ] Currency formatting consistent
- [ ] Code reviewed
