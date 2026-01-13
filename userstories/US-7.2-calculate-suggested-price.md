# US-7.2: Calculate Suggested Price

## Epic
Epic 7: Pricing & Cost Calculation

## User Story
**As a** user
**I want** to see a suggested selling price based on profit margin
**So that** I can price my products appropriately

## Priority
High (MVP)

## Story Points
2

## Dependencies
- US-7.1: View Cost Breakdown

---

## Acceptance Criteria

### AC-1: Suggested Price Display
- [ ] Shown in pricing section of recipe detail
- [ ] Based on total cost + profit margin
- [ ] Formula: `total_cost × (1 + margin/100)`

### AC-2: Profit Amount
- [ ] Profit amount displayed
- [ ] Formula: `suggested_price - total_cost`

### AC-3: No Margin Set
- [ ] If profit margin is null/undefined, show "Not set"
- [ ] Or suggest setting a margin

### AC-4: Real-time Updates
- [ ] Price updates when margin changes
- [ ] Price updates when costs change

---

## Verification Steps

### Test 1: Basic Calculation
1. Total cost: €100
2. Profit margin: 25%
3. **Verify**: Suggested price = €125
4. **Verify**: Profit = €25

### Test 2: Zero Margin
1. Total cost: €100
2. Margin: 0%
3. **Verify**: Suggested price = €100
4. **Verify**: Profit = €0

### Test 3: High Margin
1. Total cost: €50
2. Margin: 100%
3. **Verify**: Suggested price = €100
4. **Verify**: Profit = €50

### Test 4: No Margin Set
1. Recipe with null profit margin
2. **Verify**: Suggested price shows "N/A" or "Set margin"

### Test 5: Update Margin
1. Change margin from 20% to 30%
2. **Verify**: Prices update immediately

---

## UI Mockup Description

```
PRICING
+------------------------------------------------------------------+
| Profit Margin:       25%                                          |
| Total Cost:          €100.00                                      |
|-------------------------------------------------------------------|
| Suggested Price:     €125.00                                      |
| Profit Amount:       €25.00                                       |
+------------------------------------------------------------------+
```

---

## Technical Notes

- Calculation in backend pricing service
- Decimal precision for monetary values

```typescript
suggestedPrice = totalCost * (1 + profitMargin / 100);
profitAmount = suggestedPrice - totalCost;
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Handles edge cases (no margin)
- [ ] Code reviewed
