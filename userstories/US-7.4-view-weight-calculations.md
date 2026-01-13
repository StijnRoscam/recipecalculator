# US-7.4: View Weight Calculations

## Epic
Epic 7: Pricing & Cost Calculation

## User Story
**As a** user
**I want** to see weight-based cost analysis
**So that** I can price by weight when needed

## Priority
Medium

## Story Points
3

## Dependencies
- US-7.1: View Cost Breakdown

---

## Acceptance Criteria

### AC-1: Gross Weight
- [ ] Sum of all ingredient weights displayed
- [ ] Converted to common unit (kg)
- [ ] Formula: `Σ(ingredient quantities in kg)`

### AC-2: Waste Calculation
- [ ] Waste amount shown if waste percentage set
- [ ] Formula: `gross_weight × (waste_percentage / 100)`
- [ ] Displayed in kg

### AC-3: Net Weight
- [ ] Net weight after waste displayed
- [ ] Formula: `gross_weight - waste_amount`

### AC-4: Cost Per Kg (Gross)
- [ ] Total cost ÷ gross weight
- [ ] Shows price per kg before waste

### AC-5: Cost Per Kg (Net)
- [ ] Total cost ÷ net weight
- [ ] Shows price per kg accounting for waste
- [ ] Higher than gross cost per kg

### AC-6: Applicability
- [ ] Only shown for weight-based recipes
- [ ] Or always shown (just informative)

---

## Verification Steps

### Test 1: Gross Weight Calculation
1. Ingredients:
   - Beef: 2 kg
   - Carrots: 500g = 0.5 kg
   - Salt: 50g = 0.05 kg
2. **Verify**: Gross weight = 2.55 kg

### Test 2: Waste Calculation
1. Gross weight: 2.55 kg
2. Waste: 10%
3. **Verify**: Waste amount = 0.255 kg
4. **Verify**: Net weight = 2.295 kg

### Test 3: Cost Per Kg Gross
1. Total cost: €51.00
2. Gross weight: 2.55 kg
3. **Verify**: Cost per kg (gross) = €20.00

### Test 4: Cost Per Kg Net
1. Total cost: €51.00
2. Net weight: 2.295 kg
3. **Verify**: Cost per kg (net) = €22.22

### Test 5: No Waste
1. Waste percentage: 0% or null
2. **Verify**: Net weight = Gross weight
3. **Verify**: Cost per kg net = Cost per kg gross

### Test 6: Unit Conversion
1. Mix of kg and g ingredients
2. **Verify**: All correctly converted to kg for sum

---

## UI Mockup Description

```
WEIGHT ANALYSIS
+------------------------------------------------------------------+
| Gross Weight:        2.55 kg                                      |
| Waste (10%):         0.26 kg                                      |
| Net Weight:          2.29 kg                                      |
|-------------------------------------------------------------------|
| Cost per kg (gross): €20.00                                       |
| Cost per kg (net):   €22.27                                       |
+------------------------------------------------------------------+
```

---

## Technical Notes

- Unit conversion required (g → kg: divide by 1000)
- Only meaningful for recipes with weight-based ingredients
- Calculation:
  ```typescript
  grossWeight = ingredients.reduce((sum, i) => {
    const weightInKg = i.unit === 'g' ? i.quantity / 1000 : i.quantity;
    return sum + weightInKg;
  }, 0);

  wasteAmount = grossWeight * (wastePercentage / 100);
  netWeight = grossWeight - wasteAmount;

  costPerKgGross = totalCost / grossWeight;
  costPerKgNet = totalCost / netWeight;
  ```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Unit conversions correct
- [ ] Waste calculations accurate
- [ ] Code reviewed
