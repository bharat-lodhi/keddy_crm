# 🔍 GST Rate Bug Analysis & Solution

## 📋 Problem Summary
When creating an invoice, even though you set a **custom GST rate (0% or any other value)**, the system **automatically applies 18% GST** instead of using your input value.

---

## 🐛 Root Causes Identified

### **Issue #1: Frontend - GST Rate Not Sent in Payload ❌**
**File:** `frontend/src/pages/Accounts/CreateInvoicePage.jsx`

#### Current Situation:
- **Line 344:** GST rate field is initialized with default value `gst_rate: 18`
- **Line 577:** User CAN input custom GST rate in the form UI
- **Lines 400-415 (Payload):** When form is submitted, `gst_rate` is **NOT included** in the payload sent to backend

```javascript
// What gets sent (Line ~410):
const payload = {
  client: selectedClient.id,
  company_bank_account: selectedBank,
  invoice_type: "CANDIDATE",
  invoice_date: invoiceDate,
  billing_month: billingMonth,
  due_date: dueDate,
  items: items.map(i => ({
    candidate: i.candidate,
    title: i.title,
    description: i.description,
    sac_code: i.sac_code,
    billing_type: i.billing_type,
    monthly_rate: i.monthly_rate,
    total_days: i.total_days,
    working_days: i.working_days,
    hourly_rate: i.hourly_rate,
    total_hours: i.total_hours,
    amount: i.amount
    // ❌ MISSING: gst_rate: i.gst_rate
  }))
};
```

**Impact:** Backend never receives the user's GST input → defaults to company setting

---

### **Issue #2: Backend - Auto Default GST Override ⚠️**
**File:** `backend/invoicing/views.py`

#### Current Logic (Lines 58-68):
```python
# =========================
# DEFAULT GST APPLY
# =========================
if not invoice.gst_rate or invoice.gst_rate == 0:
    company_settings = CompanyFinanceSettings.objects.filter(
        created_by=company_root
    ).first()

    if company_settings and company_settings.default_gst_rate:
        invoice.gst_rate = company_settings.default_gst_rate
```

**Problem:** 
- Condition: `if not invoice.gst_rate or invoice.gst_rate == 0:`
- This checks if GST is falsy OR equals 0
- When user intentionally sets GST to 0, it gets overridden by company default (18%)
- **User's choice is completely ignored**

**Impact:** Even if GST is sent correctly, setting it to 0 won't work because of this auto-override

---

### **Issue #3: Database Field Structure 📊**

**Problem Areas:**
1. **Invoice Model** (`backend/invoicing/models.py`):
   - Has `gst_rate` field at **Invoice level** (for whole invoice)
   - Default: `0` → But backend overrides to `18%`

2. **InvoiceItem Model** (`backend/invoicing/models.py`):
   - NO `gst_rate` field defined
   - Frontend adds `gst_rate` to items, but it's local state only, not saved to DB
   - GST is calculated only at Invoice level, not per-item

---

## 💡 How to Fix

### **Fix #1: Frontend - Include GST Rate in Payload** ✅
**File:** `frontend/src/pages/Accounts/CreateInvoicePage.jsx`

**Location:** Around line 410 where payload is created

**Change Required:**
```javascript
// BEFORE:
items: items.map(i => ({
  candidate: i.candidate,
  title: i.title,
  description: i.description,
  sac_code: i.sac_code,
  billing_type: i.billing_type,
  monthly_rate: i.monthly_rate,
  total_days: i.total_days,
  working_days: i.working_days,
  hourly_rate: i.hourly_rate,
  total_hours: i.total_hours,
  amount: i.amount
}))

// AFTER - Add this line:
items: items.map(i => ({
  candidate: i.candidate,
  title: i.title,
  description: i.description,
  sac_code: i.sac_code,
  billing_type: i.billing_type,
  monthly_rate: i.monthly_rate,
  total_days: i.total_days,
  working_days: i.working_days,
  hourly_rate: i.hourly_rate,
  total_hours: i.total_hours,
  amount: i.amount,
  gst_rate: i.gst_rate  // ✅ ADD THIS
}))
```

---

### **Fix #2: Backend - Respect User's GST Choice** ✅
**File:** `backend/invoicing/views.py`

**Location:** Lines 58-68 in `CreateInvoiceAPIView.post()`

**Current Logic:**
```python
if not invoice.gst_rate or invoice.gst_rate == 0:
    # Always applies company default
    invoice.gst_rate = company_settings.default_gst_rate
```

**Better Approach:**
```python
if invoice.gst_rate is None:  # Only if not provided
    # Apply company default
    if company_settings and company_settings.default_gst_rate:
        invoice.gst_rate = company_settings.default_gst_rate
    else:
        invoice.gst_rate = Decimal("0.00")
else:
    # Keep user's choice (even if 0)
    pass
```

**Explanation:**
- `if invoice.gst_rate is None:` → Only override if truly not provided
- Remove the `or invoice.gst_rate == 0` condition → Allow 0% GST if user wants
- This respects user's explicit choice

---

### **Fix #3: Add Invoice-Level GST Input** (Optional but Recommended) 📝
**File:** `frontend/src/pages/Accounts/CreateInvoicePage.jsx`

**Why:** Currently GST is only at item level. For better UX, add a top-level GST field:

**Location:** Around line 430-450, after "Invoice Items" section header

**Add:**
```jsx
<div style={styles.grid3}>
  <div>
    <label style={styles.label}>Invoice GST Rate (%)</label>
    <input 
      type="number" 
      style={styles.input} 
      placeholder="18" 
      value={invoiceGstRate} 
      onChange={e => setInvoiceGstRate(Number(e.target.value) || 0)}
    />
  </div>
</div>
```

**Then in payload:**
```javascript
const payload = {
  client: selectedClient.id,
  gst_rate: invoiceGstRate,  // ✅ ADD AT INVOICE LEVEL
  items: items.map(...)
}
```

---

## 🔄 Complete Data Flow (After Fixes)

```
User Input
   ↓
Frontend Form (CreateInvoicePage.jsx)
   ├─ Collects: gst_rate from UI ✅
   └─ Sends in Payload ✅
        ↓
Backend API (views.py - CreateInvoiceAPIView)
   ├─ Receives: gst_rate from payload ✅
   ├─ Logic: If gst_rate is None → Apply company default
   ├─ Logic: If gst_rate is provided → Keep user's value ✅
   └─ Saves to Invoice model
        ↓
Database
   └─ Stores correct GST rate (0%, 18%, or custom)
        ↓
Invoice PDF/Report
   └─ Displays correct GST amount
```

---

## 🧪 Test Scenarios After Fix

| Test Case | Input GST | Expected | Current (Bug) |
|-----------|-----------|----------|--------------|
| Default apply | Not sent | 18% | 18% ✓ |
| User sets 0% | 0 | 0% | 18% ✗ |
| User sets 5% | 5 | 5% | 18% ✗ |
| User sets 28% | 28 | 28% | 18% ✗ |

---

## 📋 Summary of Files to Modify

| File | Issue | Fix Type |
|------|-------|----------|
| `frontend/src/pages/Accounts/CreateInvoicePage.jsx` | GST not in payload | Add `gst_rate` to items |
| `backend/invoicing/views.py` | Auto-override logic | Change condition to respect user choice |
| `frontend/src/pages/Accounts/CreateInvoicePage.jsx` | No invoice-level GST UI | Add GST input field (optional) |

---

## ✅ Priority Order to Fix

1. **HIGH:** Backend fix (views.py) - Prevents override of intentional 0%
2. **HIGH:** Frontend payload fix (CreateInvoicePage.jsx) - Sends user's GST value
3. **MEDIUM:** Invoice-level GST input - Better UX (optional but recommended)
4. **MEDIUM:** Similar fixes needed in EditInvoicePage.jsx

---

## 🚀 Quick Reference

**The 18% appears because:**
1. ❌ Frontend doesn't send GST in payload
2. ❌ Backend auto-applies company default (18%)
3. ❌ Backend override ignores intentional 0% values

**After fix:**
1. ✅ Frontend sends GST in payload
2. ✅ Backend respects user's choice
3. ✅ 0% or custom rates work correctly
