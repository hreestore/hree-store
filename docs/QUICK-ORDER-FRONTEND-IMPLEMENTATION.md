# Quick Order - Frontend Implementation Guide

## Overview

Complete guide for implementing the Quick Order feature with CustomerAuth, OTP verification, and discount code
validation.

**Date:** February 5, 2026  
**Status:** ✅ Complete Implementation Guide

---

## 🎯 Feature Summary

### Two Flow Scenarios

> **Important:** The frontend does NOT know which scenario will occur beforehand. The user always submits the same form,
> and the backend determines the flow based on whether the email exists in the system.

**Scenario A: New Customer (Email Not Registered)**

1. User submits order form with password
2. Backend detects email is NEW
3. Order created immediately
4. Response includes order + token
5. User automatically logged in

**Scenario B: Existing Customer (Email Already Registered)**

1. User submits order form (password optional/ignored)
2. Backend detects email EXISTS
3. OTP sent to email
4. Response includes `requires_otp: true` + order preview
5. Frontend shows OTP modal
6. User enters OTP
7. Frontend submits to verify endpoint
8. Order created + token returned
9. User automatically logged in

### Key Point

The frontend submits the **same form** regardless of whether the email exists. The backend response (
`requires_otp: true` or order data) determines which UI flow to show.

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ User Fills Quick Order Form                        │
│ (Always shows password field)                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ Submit to POST /quick-order/store                  │
│ Frontend doesn't know if email exists              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ Backend Checks: Does email exist?                  │
└──────────┬────────────────────────┬─────────────────┘
           │                        │
    NO (New Email)            YES (Existing Email)
           │                        │
           ▼                        ▼
┌────────────────────┐    ┌────────────────────────┐
│ Response A:        │    │ Response B:            │
│ {                  │    │ {                      │
│   order: {...},    │    │   requires_otp: true,  │
│   customer: {...}, │    │   email: "...",        │
│   token: "..."     │    │   order_preview: {...} │
│ }                  │    │ }                      │
└─────────┬──────────┘    └──────────┬─────────────┘
          │                          │
          ▼                          ▼
┌────────────────────┐    ┌────────────────────────┐
│ Frontend:          │    │ Frontend:              │
│ • Store token      │    │ • Show OTP modal       │
│ • Auto-login       │    │ • User enters OTP      │
│ • Redirect         │    │ • Submit to verify     │
└────────────────────┘    │ • Order created        │
                          │ • Store token          │
                          │ • Auto-login           │
                          │ • Redirect             │
                          └────────────────────────┘
```

### Key Difference in Responses

**Response A (New Customer):**

```json
{
    "data": {
        "order": {
            /* order details */
        },
        "customer": {
            /* customer details */
        },
        "token": "1|abc123..."
    }
}
```

→ Frontend sees `order` object → Auto-login immediately

**Response B (Existing Customer):**

```json
{
    "data": {
        "requires_otp": true,
        "email": "john@example.com",
        "order_preview": {
            /* order data to resubmit */
        }
    }
}
```

→ Frontend sees `requires_otp: true` → Show OTP modal

---

## 📡 API Endpoints

### Endpoint 1: Submit Quick Order

```
POST /api/frontend/quick-order/store
```

### Endpoint 2: Verify OTP and Create Order

```
POST /api/frontend/quick-order/verify-and-create
```

**Required Header:**

```
X-Vendor-Key: {your_vendor_api_token}
Content-Type: application/json
```

---

## 📋 Request Format

### Step 1: Initial Order Submission

```json
{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_contact_info": "1234567890",
    "password": "SecurePass123!",
    "state_id": 1,
    "district_id": 25,
    "address": "Kathmandu, Nepal",
    "order_items": [
        {
            "item_type": "Product",
            "item_id": 919,
            "quantity": 5,
            "price": 110.00
        },
        {
            "item_type": "ProductVariant",
            "item_id": 45,
            "quantity": 2,
            "price": 250.00
        }
    ],
    "logistic_charge": 100,
    "discount_code": "SAVE10",
    "remarks": "Please deliver in the morning"
}
```

### Field Requirements

| Field                     | Type   | Required       | Description                                |
|---------------------------|--------|----------------|--------------------------------------------|
| `customer_name`           | string | ✅ Yes          | Full name (max 255 chars)                  |
| `customer_email`          | string | ✅ Yes          | Valid email address                        |
| `customer_contact_info`   | string | ✅ Yes          | Phone number                               |
| `password`                | string | ⚠️ Conditional | Required for NEW emails only (min 8 chars) |
| `state_id`                | number | ✅ Yes          | Valid state ID                             |
| `district_id`             | number | ✅ Yes          | Valid district ID                          |
| `address`                 | string | ✅ Yes          | Delivery address (max 500 chars)           |
| `order_items`             | array  | ✅ Yes          | Array of products/variants (min 1)         |
| `order_items[].item_type` | string | ✅ Yes          | "Product" or "ProductVariant"              |
| `order_items[].item_id`   | number | ✅ Yes          | Product or variant ID                      |
| `order_items[].quantity`  | number | ✅ Yes          | Quantity (min 1)                           |
| `order_items[].price`     | number | ✅ Yes          | Item price (min 0)                         |
| `logistic_charge`         | number | ❌ No           | Shipping cost (default 0)                  |
| `discount_code`           | string | ❌ No           | Discount code (uppercase)                  |
| `remarks`                 | string | ❌ No           | Special instructions (max 1000 chars)      |

---

## 📤 Response Handling

### Response A: New Customer (Order Created)

```json
{
    "status": 200,
    "success": true,
    "message": "Order created successfully",
    "data": {
        "order": {
            "order_id": 10,
            "order_number": "ORD-027-202602-0001",
            "order_date": "2026-02-05",
            "status": "pending",
            "order_from": "web",
            "party": {
                "id": 65,
                "full_name": "John Doe",
                "phone_number": "1234567890",
                "email": "john@example.com"
            },
            "subtotal": "550.00",
            "discount_amount": "55.00",
            "logistic_charge": "100.00",
            "total_amount": "595.00",
            "order_items": [
                ...
            ]
        },
        "customer": {
            "id": 123,
            "party_id": 456,
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone_number": "1234567890",
            "email_verified": false
        },
        "token": "1|abc123def456...",
        "token_type": "Bearer"
    }
}
```

**Frontend Action:**

```javascript
// Store token and customer data
localStorage.setItem('token', response.data.token);
localStorage.setItem('customer', JSON.stringify(response.data.customer));

// Redirect to order confirmation
window.location.href = `/orders/${response.data.order.order_id}`;
```

---

### Response B: Existing Customer (OTP Required)

```json
{
    "status": 200,
    "success": true,
    "message": "Email already registered. OTP has been sent to your email. Please verify to complete your order.",
    "data": {
        "requires_otp": true,
        "email": "john@example.com",
        "party_id": 456,
        "expires_in_minutes": 5,
        "order_preview": {
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_contact_info": "1234567890",
            "state_id": 1,
            "district_id": 25,
            "address": "Kathmandu, Nepal",
            "order_items": [
                ...
            ],
            "logistic_charge": 100,
            "discount_code": "SAVE10",
            "remarks": "Please deliver in the morning"
        }
    }
}
```

**Frontend Action:**

```javascript
// Store order data temporarily
sessionStorage.setItem('orderPreview', JSON.stringify(response.data.order_preview));

// Show OTP modal
showOtpModal({
    email: response.data.email,
    expiresIn: response.data.expires_in_minutes
});
```

---

### Step 2: OTP Verification Request

```json
{
    "email": "john@example.com",
    "otp_code": "123456",
    "customer_name": "John Doe",
    "customer_contact_info": "1234567890",
    "state_id": 1,
    "district_id": 25,
    "address": "Kathmandu, Nepal",
    "order_items": [
        {
            "item_type": "Product",
            "item_id": 919,
            "quantity": 5,
            "price": 110.00
        }
    ],
    "logistic_charge": 100,
    "discount_code": "SAVE10",
    "remarks": "Please deliver in the morning"
}
```

**Response: Order Created with Token**

Same as Response A - includes order, customer, and authentication token.

---

## 🎨 Complete Frontend Flow

### How Frontend Detects the Scenario

The frontend **does not need to check** if the email exists beforehand. Instead:

1. **User fills form** (always include password field for safety)
2. **Submit to `/quick-order/store`** endpoint
3. **Check response** for `requires_otp` property:
    - If `requires_otp: true` → Scenario B (show OTP modal)
    - If order object returned → Scenario A (auto-login)

### Decision Flow

```javascript
// Frontend doesn't know email status beforehand
// It's determined by the API response

async function submitQuickOrder(formData) {
    const result = await apiCall('/quick-order/store', formData);

    if (result.success) {
        // Check the response to determine the scenario
        if (result.data.requires_otp) {
            // ✅ Scenario B detected: Email exists, OTP required
            handleOtpRequired(result.data);
        } else {
            // ✅ Scenario A detected: New email, order created
            handleOrderSuccess(result.data);
        }
    }
}
```

### JavaScript Implementation

```javascript
// Configuration
const API_BASE_URL = '/api/frontend';
const VENDOR_API_KEY = 'your_vendor_api_token';

// Helper: API Call
async function apiCall(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'X-Vendor-Key': VENDOR_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

// Step 1: Submit Quick Order
async function submitQuickOrder(formData) {
    try {
        const result = await apiCall('/quick-order/store', formData);

        if (result.success) {
            if (result.data.requires_otp) {
                // Existing customer - show OTP modal
                handleOtpRequired(result.data);
            } else {
                // New customer - order created, auto-login
                handleOrderSuccess(result.data);
            }
        } else {
            // Handle errors
            handleError(result.message, result.data);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An unexpected error occurred. Please try again.');
    }
}

// Step 2: Handle OTP Required
function handleOtpRequired(data) {
    // Store order data temporarily
    sessionStorage.setItem('orderPreview', JSON.stringify(data.order_preview));
    sessionStorage.setItem('otpEmail', data.email);

    // Show OTP modal
    document.getElementById('otp-modal').style.display = 'block';
    document.getElementById('otp-email').textContent = data.email;

    // Start countdown timer
    startCountdownTimer(data.expires_in_minutes * 60);

    // Show success message
    showSuccess('OTP has been sent to your email. Please check your inbox.');
}

// Step 3: Verify OTP and Create Order
async function verifyOtpAndCreate(otpCode) {
    const orderData = JSON.parse(sessionStorage.getItem('orderPreview'));
    const email = sessionStorage.getItem('otpEmail');

    const payload = {
        email: email,
        otp_code: otpCode,
        ...orderData
    };

    try {
        const result = await apiCall('/quick-order/verify-and-create', payload);

        if (result.success) {
            // Clear temporary data
            sessionStorage.removeItem('orderPreview');
            sessionStorage.removeItem('otpEmail');

            // Order created - auto-login
            handleOrderSuccess(result.data);
        } else {
            handleError(result.message, result.data);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to verify OTP. Please try again.');
    }
}

// Step 4: Handle Order Success (Auto-Login)
function handleOrderSuccess(data) {
    // Store authentication token
    localStorage.setItem('token', data.token);
    localStorage.setItem('customer', JSON.stringify(data.customer));

    // Show success message
    showSuccess('Order placed successfully! You are now logged in.');

    // Hide OTP modal if visible
    document.getElementById('otp-modal').style.display = 'none';

    // Redirect to order confirmation page
    setTimeout(() => {
        window.location.href = `/orders/${data.order.order_id}`;
    }, 2000);
}

// Helper: Error Handler
function handleError(message, data) {
    // Check specific error types
    if (data && data.password) {
        showError('Password is required for new customers.');
    } else if (message.includes('Minimum order amount')) {
        showError(message);
    } else if (message.includes('Invalid or expired discount code')) {
        showError('The discount code is invalid or has expired.');
    } else if (message.includes('Too many OTP requests')) {
        showError(message);
    } else if (message.includes('Invalid OTP')) {
        showError('The OTP code you entered is incorrect. Please try again.');
    } else if (message.includes('expired')) {
        showError('The OTP code has expired. Please request a new one.');
    } else {
        showError(message || 'An error occurred. Please try again.');
    }
}

// Helper: Countdown Timer
function startCountdownTimer(seconds) {
    const timerElement = document.getElementById('otp-timer');
    let remaining = seconds;

    const interval = setInterval(() => {
        remaining--;
        const minutes = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

        if (remaining <= 0) {
            clearInterval(interval);
            timerElement.textContent = 'Expired';
            showError('OTP has expired. Please submit the order again.');
        }
    }, 1000);
}

// Helper: Show Success Message
function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.textContent = message;
    document.body.prepend(alertDiv);

    setTimeout(() => alertDiv.remove(), 5000);
}

// Helper: Show Error Message
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-error';
    alertDiv.textContent = message;
    document.body.prepend(alertDiv);

    setTimeout(() => alertDiv.remove(), 5000);
}
```

---

## 🎨 HTML Structure

### Quick Order Form

```html
<!-- Quick Order Form -->
<form id="quick-order-form" onsubmit="handleSubmit(event)">
    <h2>Quick Order</h2>

    <!-- Customer Information -->
    <div class="form-section">
        <h3>Customer Information</h3>

        <input type="text" name="customer_name" placeholder="Full Name" required/>
        <input type="email" name="customer_email" placeholder="Email" required/>
        <input type="tel" name="customer_contact_info" placeholder="Phone Number" required/>
        <input type="password" name="password" placeholder="Password (for new customers)" minlength="8"/>
        <small>Password is required only for first-time customers</small>
    </div>

    <!-- Delivery Address -->
    <div class="form-section">
        <h3>Delivery Address</h3>

        <select name="state_id" required>
            <option value="">Select State</option>
            <!-- Options populated from API -->
        </select>

        <select name="district_id" required>
            <option value="">Select District</option>
            <!-- Options populated from API -->
        </select>

        <textarea name="address" placeholder="Detailed Address" required></textarea>
    </div>

    <!-- Order Items -->
    <div class="form-section">
        <h3>Order Items</h3>
        <div id="order-items">
            <!-- Dynamically added items -->
        </div>
        <button type="button" onclick="addItem()">Add Item</button>
    </div>

    <!-- Shipping & Discount -->
    <div class="form-section">
        <input type="number" name="logistic_charge" placeholder="Logistic Charge (optional)" min="0" step="0.01"/>
        <input type="text" name="discount_code" placeholder="Discount Code (optional)"/>
        <textarea name="remarks" placeholder="Special Instructions (optional)"></textarea>
    </div>

    <!-- Submit Button -->
    <button type="submit" id="submit-btn">Place Order</button>
</form>

<!-- OTP Modal -->
<div id="otp-modal" class="modal" style="display: none;">
    <div class="modal-content">
        <h3>Verify OTP</h3>
        <p>An OTP has been sent to <strong id="otp-email"></strong></p>
        <p>Please enter the 6-digit code to complete your order</p>

        <div class="otp-inputs">
            <input type="text" maxlength="1" class="otp-digit"/>
            <input type="text" maxlength="1" class="otp-digit"/>
            <input type="text" maxlength="1" class="otp-digit"/>
            <input type="text" maxlength="1" class="otp-digit"/>
            <input type="text" maxlength="1" class="otp-digit"/>
            <input type="text" maxlength="1" class="otp-digit"/>
        </div>

        <p class="timer">Expires in: <span id="otp-timer">5:00</span></p>

        <button onclick="submitOtp()">Verify & Complete Order</button>
        <button onclick="closeOtpModal()">Cancel</button>
    </div>
</div>
```

### Form Submit Handler

```javascript
function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Build order items array
    const orderItems = [];
    document.querySelectorAll('.order-item').forEach(item => {
        orderItems.push({
            item_type: item.querySelector('[name="item_type"]').value,
            item_id: parseInt(item.querySelector('[name="item_id"]').value),
            quantity: parseFloat(item.querySelector('[name="quantity"]').value),
            price: parseFloat(item.querySelector('[name="price"]').value)
        });
    });

    // Build request payload
    const payload = {
        customer_name: formData.get('customer_name'),
        customer_email: formData.get('customer_email'),
        customer_contact_info: formData.get('customer_contact_info'),
        password: formData.get('password') || undefined,
        state_id: parseInt(formData.get('state_id')),
        district_id: parseInt(formData.get('district_id')),
        address: formData.get('address'),
        order_items: orderItems,
        logistic_charge: parseFloat(formData.get('logistic_charge')) || 0,
        discount_code: formData.get('discount_code') || undefined,
        remarks: formData.get('remarks') || undefined
    };

    // Disable submit button
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('submit-btn').textContent = 'Processing...';

    // Submit order
    submitQuickOrder(payload);
}
```

### OTP Input Handler

```javascript
// Auto-focus next input
document.querySelectorAll('.otp-digit').forEach((input, index, inputs) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

        // Auto-submit when all filled
        if (index === inputs.length - 1 && e.target.value.length === 1) {
            const otp = Array.from(inputs).map(i => i.value).join('');
            verifyOtpAndCreate(otp);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

function submitOtp() {
    const inputs = document.querySelectorAll('.otp-digit');
    const otp = Array.from(inputs).map(i => i.value).join('');

    if (otp.length !== 6) {
        showError('Please enter all 6 digits');
        return;
    }

    verifyOtpAndCreate(otp);
}

function closeOtpModal() {
    document.getElementById('otp-modal').style.display = 'none';
    sessionStorage.removeItem('orderPreview');
    sessionStorage.removeItem('otpEmail');
}
```

---

## 🚨 Error Handling

### Error Types and Responses

| Error                      | Message                                   | User Action                         |
|----------------------------|-------------------------------------------|-------------------------------------|
| **No Password (New User)** | "Password is required for new users"      | Show password field as required     |
| **Invalid Discount Code**  | "Invalid or expired discount code"        | Remove discount code or try another |
| **Minimum Order Amount**   | "Minimum order amount of X required..."   | Add more items to cart              |
| **Rate Limited**           | "Too many OTP requests..."                | Wait 10-15 minutes                  |
| **Invalid OTP**            | "Invalid OTP code"                        | Try again (max 5 attempts)          |
| **Expired OTP**            | "OTP code has expired..."                 | Request new OTP                     |
| **Product Not Found**      | "Product with ID X not found"             | Remove invalid item                 |
| **Logistic Charge Error**  | "Logistic charges can only be applied..." | Remove logistic charge for services |

### Error Display Example

```javascript
function displayValidationErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.field-error').forEach(el => el.remove());

    // Display field-specific errors
    for (const [field, messages] of Object.entries(errors)) {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = messages[0];
            input.parentNode.appendChild(errorDiv);
            input.classList.add('error');
        }
    }
}
```

---

## 🔒 Discount Code Validation

### Features

- ✅ **Code Validation:** Uppercase, trimmed
- ✅ **Date Validation:** Start date ≤ today ≤ Expiry date
- ✅ **Usage Limit:** max_usage > used_count
- ✅ **Minimum Order Amount:** Order total ≥ min_order_amount
- ✅ **Active Status:** is_active = 1

### Discount Code Errors

```javascript
// Minimum order amount not met
{
    "message"
:
    "Minimum order amount of 1,000.00 required for this discount code. Add 450.00 more to your order to apply this discount."
}

// Invalid or expired
{
    "message"
:
    "Invalid or expired discount code"
}
```

### Frontend Handling

```javascript
function handleDiscountError(message) {
    if (message.includes('Minimum order amount')) {
        // Extract required amount and show specific message
        const match = message.match(/Add ([\d,]+\.\d+) more/);
        if (match) {
            const needed = match[1];
            showError(`Add ₹${needed} more to use this discount code`);
        }
    } else {
        // Generic invalid code
        showError('This discount code is invalid or has expired');
        document.querySelector('[name="discount_code"]').value = '';
    }
}
```

---

## ✅ Testing Checklist

### New Customer Flow

- [ ] Submit with valid password → Order created immediately
- [ ] Submit without password → Error displayed
- [ ] Token returned in response
- [ ] Token stored in localStorage
- [ ] User redirected to order page
- [ ] User can access protected routes

### Existing Customer Flow

- [ ] Submit with existing email → OTP sent
- [ ] OTP modal displayed
- [ ] Timer counts down correctly
- [ ] Enter correct OTP → Order created
- [ ] Token returned and stored
- [ ] User redirected to order page

### Discount Code

- [ ] Valid code → Discount applied
- [ ] Invalid code → Error shown
- [ ] Minimum order not met → Specific error
- [ ] Expired code → Error shown

### Error Scenarios

- [ ] Missing required fields → Validation errors
- [ ] Invalid email format → Error
- [ ] Invalid product ID → Error
- [ ] Logistic charge on service → Error
- [ ] Rate limiting → Error with wait time

---

## 📱 Mobile Considerations

- Use `inputmode="numeric"` for OTP inputs
- Use `type="tel"` for phone number
- Use `type="email"` for email (mobile keyboard)
- Auto-capitalize discount codes
- Show countdown timer prominently
- Make OTP inputs large (min 50px)
- Prevent zoom on input focus
- Use bottom sheet for OTP modal on mobile

---

## 🎉 Success States

### Order Created Successfully

```javascript
// Show order confirmation
showOrderConfirmation({
    orderNumber: data.order.order_number,
    totalAmount: data.order.total_amount,
    deliveryAddress: data.order.customer_address.address
});

// Auto-login completed
showSuccess('You are now logged in!');

// Redirect after 2 seconds
setTimeout(() => {
    window.location.href = `/orders/${data.order.order_id}`;
}, 2000);
```

---

## 🔑 Token Management

### Store Token

```javascript
localStorage.setItem('token', response.data.token);
localStorage.setItem('customer', JSON.stringify(response.data.customer));
```

### Use Token

```javascript
// All authenticated requests
fetch('/api/frontend/user/cart', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-Vendor-Key': VENDOR_API_KEY
    }
});
```

### Check Login Status

```javascript
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

function getCustomer() {
    const customer = localStorage.getItem('customer');
    return customer ? JSON.parse(customer) : null;
}
```

---

## 📊 Summary

### What Frontend Needs to Handle

1. ✅ **Form Submission** with all required fields
2. ✅ **Response Type Detection** (requires_otp or order created)
3. ✅ **OTP Modal** for existing customers
4. ✅ **Token Storage** for auto-login
5. ✅ **Error Display** with user-friendly messages
6. ✅ **Discount Code Validation** feedback
7. ✅ **Countdown Timer** for OTP expiration
8. ✅ **Redirect Logic** after success

### Key Points

- 🔑 Password required ONLY for new customers
- 📧 OTP valid for 5 minutes
- 🔐 Auto-login with token after success
- 💰 Discount codes validated on backend
- 🚚 Logistic charge only for physical products
- ⏱️ Rate limiting: 3 OTP requests per 10-15 minutes

---

**End of Frontend Implementation Guide**

**Last Updated:** February 5, 2026  
**Status:** Complete and Production Ready 🚀
