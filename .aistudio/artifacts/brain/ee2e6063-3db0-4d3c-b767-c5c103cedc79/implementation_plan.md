# Implementation Plan: Real-Time Fuel, CNG, EV & Battery Replacement Pricing

Provide comprehensive real-time price displays across Fugo Express, covering fuel commodities (Petrol, Diesel, CNG, Auto LPG, EV Fast Charging), automotive batteries with old battery exchange rebates, and roadside repair rates, integrated seamlessly into the Live Rates hub and Home screen quick tickers.

---

## User Preferences & Clarified Scope
- **Commodities**: Petrol, Diesel, CNG (₹/kg), Auto LPG (₹/L), and EV Fast Charging (₹/kWh).
- **Battery Replacement Pricing**: Transparent breakdown showing New MRP, Old Battery Scrap Exchange Discount (Rebate), Net Payable Price, and Doorstep Technician Fitting.
- **Placement**: Dedicated Live Rates screen with category switchers, plus an interactive live price ticker on the Home screen and battery exchange calculator in the Store.

---

## Proposed Changes

### 1. Real-Time Pricing Engine (`src/services/livePricing.ts`)
- Build a centralized pricing engine providing live commodity rates for Hyderabad and major Indian metros:
  - **Petrol**: ₹109.66/L (High octane: ₹117.50/L)
  - **Diesel**: ₹97.82/L
  - **CNG**: ₹92.50/kg
  - **Auto LPG**: ₹64.20/L
  - **EV Fast Charging**: ₹18.50/kWh (Mobile DC Fast Charger Van)
- Automotive Battery Replacement catalog with specs, warranty, brand (Exide, Amaron, Tata Green), and exchange mechanics:
  - *Exide Epiq 35Ah (Hatchback/Sedan)*: MRP ₹4,299 | Old Battery Rebate -₹700 | Net ₹3,599
  - *Amaron FLO 45Ah (Compact SUV)*: MRP ₹5,499 | Old Battery Rebate -₹850 | Net ₹4,649
  - *Exide Mileage 65Ah (SUV/Commercial)*: MRP ₹7,899 | Old Battery Rebate -₹1,100 | Net ₹6,799
  - *Amaron Pro Bike 5Ah (Motorcycle)*: MRP ₹1,350 | Old Battery Rebate -₹250 | Net ₹1,100
- Roadside Service & Repair standard tariff:
  - Battery Jumpstart: ₹300
  - Tubeless Puncture Fix: ₹150
  - On-site Battery Health Diagnostics & Alternator Test: Free with replacement / ₹199 standalone
  - Mobile Express Waterless Wash: ₹500
- Includes dynamic timestamp, 24h price trend deltas, and live refresh capability.

---

### 2. Comprehensive Live Pricing Screen (`src/components/Screens/FuelPrices.tsx`)
- Redesign into a multi-tab "Live Rates & Tariffs" dashboard:
  - **Tab 1: Fuel & Energy (Petrol, Diesel, CNG, Auto LPG, EV)**
    - Real-time city comparison (Hyderabad, Bangalore, Mumbai, Delhi, Chennai).
    - Station price cards with interactive 7-day sparklines and price difference badges.
    - "Order Now" quick dispatch action for fuel and mobile EV charging vans.
  - **Tab 2: Battery Replacement & Exchange Calculator**
    - Interactive toggle: "With Old Battery Scrap Exchange" vs "Without Exchange".
    - Live savings calculator displaying scrap value credited instantly to the bill.
    - 15-minute doorstep technician fitting badge (Free installation + terminal greasing).
    - "Book Battery Replacement" one-click action linking directly to checkout with exchange pre-applied.
  - **Tab 3: Roadside & Workshop Service Rates**
    - Standardized rate card for 15-min emergency response vs workshop transfer.

---

### 3. Home Screen Live Ticker & Quick Actions (`src/components/Screens/Home.tsx`)
- Add a high-visibility, animated live rates ticker bar directly below the location header:
  - Displays streaming live prices: `Petrol ₹109.66/L` • `Diesel ₹97.82/L` • `CNG ₹92.50/kg` • `Batteries from ₹1,100 (Exch.)` • `EV ₹18.50/kWh`.
- Add a dedicated "Battery Replacement & Exchange" quick card alongside Fuel and Repair appointments.
- Update the "Live Fuel Prices" dashboard widget to reflect fuel, CNG, and battery live rates.

---

### 4. Spare Parts & Battery Store Integration (`src/components/Screens/Store.tsx` / `src/App.tsx`)
- Expand product definitions in `src/App.tsx` to include CNG and battery exchange models.
- Support "Exchange Old Battery" checkbox directly inside the Store and Cart so users see the instant ₹700–₹1,100 deduction reflected in the checkout total.

---

## Verification Plan

### Automated Build & Syntax Checks
- Run `compile_applet` to verify TypeScript types, dependencies, and Vite bundle compilation.
- Run `lint_applet` to ensure zero ESLint or syntax issues.

### Manual & UI Verification
- Verify navigation from Home to Live Rates hub.
- Switch between Fuel/Gas, Battery Replacement, and Service tariffs.
- Toggle the "Old Battery Scrap Exchange" switch and verify real-time total price adjustment.
- Verify that clicking "Order Now" / "Book Battery Replacement" initiates the order flow with the correct unit and pricing.
