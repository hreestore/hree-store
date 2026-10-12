# Frontend Checkout Flow: Upaya Delivery + Fonepay

This document is for the Next.js customer portal checkout flow. It covers the website customer APIs in `routes/frontend.php`, especially Upaya location/rate selection during checkout and the Fonepay dynamic QR payment flow.

## Base Rules

Base API prefix:

```text
/api/frontend
```

Required headers for all frontend APIs protected by `vendor.verify`:

```http
Vendor: <vendor_api_token>
Accept: application/json
Content-Type: application/json
```

Required header for customer-only checkout/profile/payment APIs:

```http
Authorization: Bearer <customer_access_token>
```

Standard API response shape:

```json
{
  "status": 200,
  "success": true,
  "message": "Message text",
  "data": {}
}
```

Validation failures usually return:

```json
{
  "status": 422,
  "success": false,
  "message": "Validation failed",
  "data": {
    "field_name": ["Error message"]
  }
}
```

General backend exceptions usually return `status: 400`.

## Key Capabilities From Vendor Details

Call this early when bootstrapping the storefront:

```http
GET /api/frontend/vendor-details
```

Useful fields for checkout:

```json
{
  "vendor_id": 1,
  "vendor_name": "Store",
  "tax": true,
  "currency": "NPR",
  "fonepay_enabled": true,
  "upaya_delivery_enabled": true
}
```

Frontend behavior:

- If `upaya_delivery_enabled` is `true`, physical-product checkout must collect Upaya `location_id` and `area_id`.
- If `fonepay_enabled` is `true`, show Fonepay as an online payment option.
- Do not expose or depend on vendor Fonepay credentials in the frontend. The backend handles signing and provider requests.

## Recommended Checkout Sequence

1. Customer logs in and receives a customer bearer token.
2. Customer manages cart using cart APIs.
3. Customer selects or creates a delivery address.
4. If Upaya is enabled and cart has physical products:
   - Fetch Upaya locations.
   - Let customer select a location and area.
   - Fetch the Upaya delivery rate.
   - Display that delivery rate in the order summary.
5. Optionally validate/apply a discount code.
6. Create the order with `customer_address_id`, `order_from`, optional `discount_code`, and the selected Upaya IDs.
7. If customer chooses Fonepay:
   - Initiate Fonepay for the created order.
   - Render the returned QR payload.
   - Poll/check payment status using the returned `prn`.
8. After Fonepay status becomes `paid`, refresh the order detail or order list.

Important lifecycle note:

- `cart/order/store` creates an order with `status: pending`.
- No sale exists yet at this point.
- `fonepay/initiate/{orderId}` creates a pending Fonepay payment record only.
- A sale is created only after `fonepay/status/{prn}` confirms the payment as paid. The backend then sets the order status to `confirmed` and creates the sale.

## Address APIs

List customer profile and addresses:

```http
GET /api/frontend/user/profile/
```

Create address:

```http
POST /api/frontend/user/profile/address/store
```

Payload:

```json
{
  "state_id": 1,
  "district_id": 10,
  "address": "Full delivery address"
}
```

Update address:

```http
POST /api/frontend/user/profile/address/update/{address_id}
```

Delete address:

```http
POST /api/frontend/user/profile/address/delete/{address_id}
```

Checkout order creation requires `customer_address_id` only when Upaya delivery is not used. For Upaya-enabled physical-product checkout, the delivery location comes from `upaya_location_id` and `upaya_area_id`; `customer_address_id` may be omitted.

## Upaya Location And Rate Flow

### 1. Fetch Locations

```http
GET /api/frontend/upaya-locations
```

Success response:

```json
{
  "status": 200,
  "success": true,
  "message": "Delivery locations loaded successfully",
  "data": [
    {
      "id": 1,
      "name": "Kathmandu",
      "areas": [
        {
          "id": 101,
          "name": "Baneshwor",
          "delivery_service": true,
          "cod_service": true
        }
      ]
    }
  ]
}
```

Frontend behavior:

- Use `data[].id` as `upaya_location_id`.
- Use `data[].areas[].id` as `upaya_area_id`.
- Only areas with delivery service are returned by the backend.

### 2. Fetch Delivery Rate

```http
POST /api/frontend/upaya-delivery-rate
```

Payload:

```json
{
  "location_id": 1,
  "area_id": 101
}
```

Success response:

```json
{
  "status": 200,
  "success": true,
  "message": "Delivery rate calculated successfully",
  "data": {
    "charge": 150,
    "target_weight": 1,
    "return_charge": 75,
    "location": {
      "id": 1,
      "name": "Kathmandu"
    },
    "area": {
      "id": 101,
      "name": "Baneshwor"
    }
  }
}
```

Frontend behavior:

- Show `data.charge` as the delivery charge for Upaya checkout.
- Store the selected `location.id` and `area.id`.
- Send the same IDs to `cart/order/store`.
- If the customer changes location/area, fetch the rate again.

Important implementation detail:

- `POST /api/frontend/user/cart/calculate` currently calculates old district-based logistic charge only.
- For Upaya-enabled vendors, use `upaya-delivery-rate` for the displayed delivery charge and final checkout summary.
- The final source of truth remains `cart/order/store`, which re-quotes Upaya and saves a delivery snapshot on the order.

## Cart APIs Used By Checkout

Cart list:

```http
GET /api/frontend/user/cart/
```

Add to cart:

```http
POST /api/frontend/user/cart/store
```

Update cart item:

```http
POST /api/frontend/user/cart/update/{cart_id}
```

Delete cart item:

```http
POST /api/frontend/user/cart/delete/{cart_id}
```

Clear cart:

```http
POST /api/frontend/user/cart/clear
```

Validate customization:

```http
POST /api/frontend/user/cart/validate
```

Calculate cart:

```http
POST /api/frontend/user/cart/calculate
```

Payload:

```json
{
  "discount_code": "SUMMER10",
  "customer_address_id": 12
}
```

Discount check:

```http
POST /api/frontend/user/cart/check-discount
```

Payload:

```json
{
  "discount_code": "SUMMER10"
}
```

## Create Order

```http
POST /api/frontend/user/cart/order/store
```

Payload for Upaya-enabled physical-product checkout:

```json
{
  "order_from": "web",
  "discount_code": "SUMMER10",
  "remarks": "Please call before delivery",
  "upaya_location_id": 1,
  "upaya_area_id": 101
}
```

Payload for Upaya checkout without discount:

```json
{
  "order_from": "web",
  "upaya_location_id": 1,
  "upaya_area_id": 101
}
```

Optional Upaya address behavior:

- `customer_address_id` is not required when Upaya delivery is used.
- If a valid `customer_address_id` is sent with Upaya checkout, the backend will keep it on the order.
- If omitted, the order stores `customer_address_id: null` and uses the saved Upaya delivery snapshot for delivery location/rate.

Payload when Upaya is not enabled or not used:

```json
{
  "customer_address_id": 12,
  "order_from": "web",
  "discount_code": "SUMMER10",
  "remarks": "Optional note"
}
```

Validation rules:

- `customer_address_id` is required only when Upaya delivery is not used. If provided, it must belong to the logged-in customer.
- `order_from` is required and must be `web` or `mobile`.
- `discount_code` is optional.
- `remarks` is optional.
- `upaya_location_id` and `upaya_area_id` are required when the vendor has Upaya enabled and the cart contains physical products.

If Upaya IDs are missing for an Upaya-enabled physical order:

```json
{
  "status": 422,
  "success": false,
  "message": "Validation failed",
  "data": {
    "upaya_delivery": ["Location and area are required for Upaya delivery."]
  }
}
```

Success response includes the created order:

```json
{
  "status": 200,
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order_id": 123,
    "order_number": "ORD-001-202526-0001",
    "status": "pending",
    "fulfillment_status": "upaya_quoted",
    "total_amount": "1250.00",
    "logistic_charge": "150.00",
    "upaya_delivery": {
      "dispatch_status": "quoted",
      "provider_order_id": null,
      "delivery_charge": "150.00",
      "quoted_charge": "150.00",
      "final_charge": null,
      "charge_difference": null
    },
    "sale": null
  }
}
```

Frontend behavior after successful order creation:

- Save `order_id`.
- Clear local checkout state.
- If payment method is Fonepay, immediately call Fonepay initiate for this `order_id`.
- If payment method is cash/manual, show order confirmation with `status: pending`.

## Fonepay Payment Flow

### 1. Initiate Fonepay

```http
POST /api/frontend/user/fonepay/initiate/{order_id}
```

Request body can be empty:

```json
{}
```

Backend checks:

- Order must belong to the logged-in customer.
- Order must belong to the same vendor.
- Order must not already have a sale.
- Vendor must have Fonepay credentials.
- Order total must be greater than zero.

Success response:

```json
{
  "status": 200,
  "success": true,
  "message": "Initiated Fonepay payment",
  "data": {
    "prn": "ORD123ABCDEFGH",
    "amount": 1250,
    "qr_message": "QR payload from Fonepay",
    "client_code": "client-code",
    "device_id": "device-id",
    "merchant_code": "merchant-code",
    "thirdparty_qr_websocket_url": "wss://...",
    "status": "pending",
    "qr_response": {}
  }
}
```

Frontend behavior:

- Use `qr_message` to render the dynamic QR.
- Store `prn` for status checks.
- If `thirdparty_qr_websocket_url` is available and the frontend supports it, it can be used for real-time updates.
- Still keep a fallback manual status check or polling flow using the status endpoint.

### 2. Check Fonepay Status

```http
POST /api/frontend/user/fonepay/status/{prn}
```

Request body can be empty:

```json
{}
```

Success response:

```json
{
  "status": 200,
  "success": true,
  "message": "Fonepay payment status checked",
  "data": {
    "prn": "ORD123ABCDEFGH",
    "payment_status": "paid",
    "fonepay_status": "COMPLETE",
    "fonepay_status_code": 200,
    "fonepay_message": "Request Complete",
    "trace_id": "trace-id",
    "payment_date": "2026-07-06T10:15:00.000000Z",
    "status_response": {}
  }
}
```

Possible `payment_status` values:

- `pending`: keep showing the QR and allow retry/status refresh.
- `paid`: payment is confirmed. Backend has marked the order `confirmed` and created the sale if it did not exist.
- `failed`: show failure state and allow the user to retry payment or choose another payment method.

Recommended polling:

- Poll every 3-5 seconds while the QR screen is visible.
- Stop polling after `paid`, `failed`, user cancellation, or a reasonable timeout.
- Provide a manual "Check status" button for slow provider responses.

## Order History And Detail

Order list:

```http
GET /api/frontend/user/profile/orders
```

Response shape:

```json
{
  "status": 200,
  "success": true,
  "data": {
    "email_verified": true,
    "has_hidden_orders": false,
    "hidden_orders_count": 0,
    "visible_orders_count": 1,
    "message": null,
    "orders": []
  }
}
```

Order detail:

```http
GET /api/frontend/user/profile/order/{order_id}
```

Important order fields:

```json
{
  "order_id": 123,
  "order_number": "ORD-001-202526-0001",
  "status": "pending",
  "fulfillment_status": "upaya_quoted",
  "total_amount": 1250,
  "logistic_charge": 150,
  "upaya_delivery": {
    "dispatch_status": "quoted",
    "provider_order_id": null,
    "delivery_charge": 150,
    "quoted_charge": 150,
    "final_charge": null,
    "charge_difference": null,
    "error": null
  },
  "sale": null,
  "order_items": [
    {
      "order_item_id": 1,
      "item_type": "Product",
      "item_id": 10,
      "item_name": "Product name",
      "quantity": 1,
      "returned_quantity": 0,
      "returnable_quantity": 1,
      "unit_price": 1000,
      "price": 1000,
      "total": 1000
    }
  ]
}
```

Order/sale lifecycle for frontend display:

- `sale: null` is normal before payment or vendor confirmation.
- Do not treat missing `sale` as a failed order.
- For Fonepay-paid orders, refresh order detail after `payment_status: paid`; `sale` should then be present.
- `fulfillment_status` may be Upaya-specific when an Upaya delivery snapshot exists:
  - `upaya_quoted`
  - `upaya_dispatch_pending`
  - `upaya_dispatching`
  - `upaya_dispatched`
  - `upaya_failed`

## Customer Order Update

Update address or cancel/return:

```http
POST /api/frontend/user/cart/order/update/{order_id}
```

Payload to update address before processing:

```json
{
  "customer_address_id": 13
}
```

Payload to cancel:

```json
{
  "status": "cancelled",
  "remarks": "Customer changed mind"
}
```

Payload to request return:

```json
{
  "status": "returned",
  "remarks": "Return reason"
}
```

Rules:

- Cannot update shipped or delivered orders unless using the return/cancel status flow.
- Cannot update the address after the order has a sale.
- Can cancel pending orders without a sale; no financial reversal is needed.
- Delivered orders cannot be cancelled; use return instead.
- Return is allowed only for delivered orders.

## Error States The Frontend Should Handle

Vendor header missing:

```json
{
  "status": 401,
  "success": false,
  "message": "Vendor token is required",
  "data": null
}
```

Invalid vendor:

```json
{
  "status": 401,
  "success": false,
  "message": "Unauthorised Vendor",
  "data": null
}
```

Cart empty:

```json
{
  "status": 400,
  "success": false,
  "message": "Cart is empty",
  "data": null
}
```

Fonepay already paid/processed:

```json
{
  "status": 400,
  "success": false,
  "message": "Order has already been paid.",
  "data": null
}
```

Fonepay not configured:

```json
{
  "status": 400,
  "success": false,
  "message": "Fonepay credentials are not configured for this vendor.",
  "data": null
}
```

## Next.js Implementation Notes

- Keep the vendor token in server-side config or a safe runtime environment variable. Send it as the `Vendor` header for every storefront API request.
- Keep customer bearer token handling separate from the vendor token.
- Use server actions/API routes or a shared fetch wrapper so every request consistently includes `Vendor`, `Accept`, and `Authorization` when available.
- Treat order creation and Fonepay payment as two separate steps. If Fonepay initiation fails after order creation succeeds, show the created order and allow retrying Fonepay for that order.
- Do not wait for `sale` on the order immediately after checkout. Sale creation is intentionally delayed until payment confirmation or vendor confirmation.
- For Upaya, always re-submit the selected `upaya_location_id` and `upaya_area_id` during order creation. The rate endpoint is only for preview; the backend re-quotes and saves the delivery snapshot.
- After Fonepay `paid`, refetch `GET /api/frontend/user/profile/order/{order_id}` or `GET /api/frontend/user/profile/orders` to update UI state.


