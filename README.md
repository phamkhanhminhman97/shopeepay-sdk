# shopeepay-sdk

> TypeScript SDK for [ShopeePay Payment Gateway](https://www.shopeepay.com) APIs — V1 Payment Gateway & V3 Merchant-Host Checkout / Account Linking.

<p align="center">
  <a href="https://www.npmjs.com/package/shopeepay-sdk">
    <img src="https://img.shields.io/npm/v/shopeepay-sdk" alt="npm version">
  </a>
  <a href="https://github.com/phamkhanhminhman97/shopeepay-sdk/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/phamkhanhminhman97/shopeepay-sdk/ci.yml?branch=main" alt="CI">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license">
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="node version">
  <img src="https://img.shields.io/badge/types-TypeScript-blue" alt="typescript">
</p>

---

## Features

- **V1 Payment Gateway** — Create checkout sessions, process refunds, query transaction status.
- **V3 Merchant-Host APIs** — Checkout order, account linking, access token management, user info, coin redemption.
- **Webhook Verification** — Verify ShopeePay callback signatures with built-in HMAC-SHA256 validation.
- **Response Signature Validation** — Automatically validates response signatures from ShopeePay servers.
- **Dual ESM / CJS** — Works with `import` and `require`.
- **Full TypeScript** — Complete type definitions included.

---

## Table of Contents

- [shopeepay-sdk](#shopeepay-sdk)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Quick Start](#quick-start)
  - [Usage](#usage)
    - [Client Options](#client-options)
    - [V1 Checkout Session](#v1-checkout-session)
    - [V3 Merchant-Host Checkout](#v3-merchant-host-checkout)
    - [V3 Account Linking](#v3-account-linking)
    - [Webhook Verification](#webhook-verification)
  - [API Reference](#api-reference)
    - [Class: `ShopeePayModule`](#class-shopeepaymodule)
      - [V1 — Payment Gateway](#v1--payment-gateway)
      - [V3 — Merchant-Host APIs](#v3--merchant-host-apis)
      - [Security / Utilities](#security--utilities)
  - [Continuous Integration](#continuous-integration)
  - [Error Handling](#error-handling)
  - [TypeScript Types](#typescript-types)
  - [Publishing](#publishing)
  - [License](#license)

---

## Install

```sh
npm install shopeepay-sdk
```

> Requires **Node.js >= 18**.

---

## Quick Start

```ts
import { ShopeePayModule } from "shopeepay-sdk";

const shopeePay = new ShopeePayModule({
  clientId: process.env.SHOPEEPAY_CLIENT_ID!,
  secretKey: process.env.SHOPEEPAY_SECRET_KEY!,
  region: "VN",
  environment: "sandbox" // or "production"
});

// Create a checkout session
const checkout = await shopeePay.createCheckoutSession({
  reference_id: "order-1001",
  merchant_ext_id: "merchant-id",
  amount: 100000,
  currency: "VND",
  return_url: "https://merchant.example/orders/order-1001"
});

// Redirect the customer
console.log(checkout.checkout_url);
```

---

## Usage

### Client Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `clientId` | `string` | ✅ | — | ShopeePay Client ID |
| `secretKey` | `string` | ✅ | — | ShopeePay Secret Key |
| `region` | `"ID" \| "MY" \| "PH" \| "SG" \| "TH" \| "VN"` | ✅ | — | Country region |
| `environment` | `"sandbox" \| "production"` | ❌ | `"sandbox"` | API environment |
| `baseUrl` | `string` | ❌ | Auto-built | Override the base URL |
| `fetch` | `FetchLike` | ❌ | `globalThis.fetch` | Custom fetch implementation |

---

### V1 Checkout Session

Create a hosted payment page and redirect the customer.

```ts
import { ShopeePayModule } from "shopeepay-sdk";

const shopeePay = new ShopeePayModule({
  clientId: process.env.SHOPEEPAY_CLIENT_ID!,
  secretKey: process.env.SHOPEEPAY_SECRET_KEY!,
  region: "VN",
  environment: "sandbox"
});

// Create checkout session
const checkout = await shopeePay.createCheckoutSession({
  reference_id: "order-1001",
  merchant_ext_id: "merchant-id",
  store_ext_id: "store-id",
  amount: 100000,
  currency: "VND",
  return_url: "https://merchant.example/orders/order-1001",
  validity_period: 1200,
  allowed_payment_method: ["spp_wallet", "viet_qr"],
  items: [
    { name: "Product A", quantity: 1, price: 100000 }
  ],
  customer: {
    name: "Nguyen Van A",
    email: "customer@example.com",
    phone_number: "+84901234567"
  }
});

// → Redirect customer to checkout.checkout_url
console.log(checkout.checkout_url);

// Check status
const status = await shopeePay.getCheckoutStatus(checkout.checkout_id);
console.log(status.status); // "active" | "successful" | "expired" | ...

// Cancel checkout
await shopeePay.cancelCheckout(checkout.checkout_id);

// Refund a successful checkout
const refund = await shopeePay.createRefund({
  original_checkout_id: checkout.checkout_id,
  refund_reference_id: "refund-1001",
  amount: 100000
});

// Check refund status
const refundStatus = await shopeePay.getRefundStatus(refund.refund_id);
```

---

### V3 Merchant-Host Checkout

Create a direct checkout order that redirects customers to the Shopee / ShopeePay app.

```ts
import { ShopeePayModule } from "shopeepay-sdk";

const shopeePay = new ShopeePayModule({
  clientId: process.env.SHOPEEPAY_CLIENT_ID!,
  secretKey: process.env.SHOPEEPAY_SECRET_KEY!,
  region: "ID",
  environment: "sandbox"
});

const order = await shopeePay.createCheckoutOrder({
  request_id: "request-1001",
  payment_reference_id: "order-1001",
  merchant_ext_id: "merchant-id",
  store_ext_id: "store-id",
  amount: 10000,
  currency: "IDR",
  return_url: "https://merchant.example/orders/order-1001",
  platform_type: "app",
  preferred_payment_method_type: "spay_later"
});

// Redirect customer to order.redirect_url_http
console.log(order.redirect_url_http);

// Or display QR
console.log(order.qr_content);
console.log(order.qr_url);
```

> **⚠️ Important:** Redirect to `return_url` should never be used as an indication of payment success. Always verify payment status via ShopeePay callback or server-side status check.

---

### V3 Account Linking

Link a ShopeePay account to your platform for future payments (Link & Pay, Subscription).

```ts
import { ShopeePayModule } from "shopeepay-sdk";

const shopeePay = new ShopeePayModule({
  clientId: process.env.SHOPEEPAY_CLIENT_ID!,
  secretKey: process.env.SHOPEEPAY_SECRET_KEY!,
  region: "ID",
  environment: "sandbox"
});

// Step 1: Initiate account linking
const link = await shopeePay.initiateAccountLinking({
  request_id: "link-request-1001",
  return_url: "https://merchant.example/shopeepay/link-return",
  linking_reference_id: "customer-1001-shopeepay",
  merchant_ext_id: "merchant-id",
  service_name: "Merchant Wallet Binding",
  service_id: "wallet-binding",
  linking_description: "Link ShopeePay for future payments",
  phone: "6282112345678",
  platform_type: "mweb"
});

// Redirect customer to link.redirect_url_web
console.log(link.redirect_url_web);

// Step 2: After customer approves, get the access token
const token = await shopeePay.getAccessToken({
  request_id: "token-request-1001",
  linking_reference_id: "customer-1001-shopeepay"
});

// Step 3: Get user info
const user = await shopeePay.getUserInfo({
  request_id: "user-info-1001",
  access_token: token.access_token!
});

console.log(user.user_info);

// Step 4: Get coin redemption info
const coinInfo = await shopeePay.getCoinRedemptionInfo({
  request_id: "coin-1001",
  access_token: token.access_token!,
  payment_amount: 10000
});

// Step 5: Unlink account when needed
await shopeePay.unlinkAccount({
  request_id: "unlink-1001",
  linking_reference_id: "customer-1001-shopeepay"
});
```

> **🔒 Security:** Store the `access_token` securely on your server only — never expose it to the client side.

---

### Webhook Verification

Verify incoming ShopeePay webhook callbacks using the `X-Airpay-Req-H` header.

```ts
import { ShopeePayModule } from "shopeepay-sdk";

const shopeePay = new ShopeePayModule({
  clientId: process.env.SHOPEEPAY_CLIENT_ID!,
  secretKey: process.env.SHOPEEPAY_SECRET_KEY!,
  region: "VN",
  environment: "sandbox"
});

// For payment webhooks (includes event_type)
const event = shopeePay.verifyWebhook(rawBody, req.headers["x-airpay-req-h"]);

if (event.event_type === "checkout.successful") {
  // Mark order as paid after verifying your own order reference
}

// For account-linking callbacks (no event_type field)
import type { NotifyAccountLinkStatusPayload } from "shopeepay-sdk";

const notification = shopeePay.verifyNotification<NotifyAccountLinkStatusPayload>(
  rawBody,
  req.headers["x-airpay-req-h"]
);

if (notification.update_type === 1) {
  // Customer authorized linking — call getAccessToken()
}
```

> **📝 Note:** Use the **raw request body** as the first argument. The signature must be read from the `X-Airpay-Req-H` header.

---

## API Reference

### Class: `ShopeePayModule`

Aliases: `ShopeePayClient`, `ShopeePay` (backward compatible).

#### V1 — Payment Gateway

| Method | HTTP | Endpoint |
|--------|------|----------|
| [`createCheckoutSession(request)`](#createcheckoutsession) | `POST` | `/v1/checkout` |
| [`getCheckoutStatus(checkoutId)`](#getcheckoutstatus) | `GET` | `/v1/checkout/:id` |
| [`createRefund(request)`](#createrefund) | `POST` | `/v1/refund` |
| [`getRefundStatus(refundId)`](#getrefundstatus) | `GET` | `/v1/refund/:id` |
| [`cancelCheckout(checkoutId)`](#cancelcheckout) | `POST` | `/v1/checkout/cancel/:id` |

#### V3 — Merchant-Host APIs

| Method | HTTP | Endpoint |
|--------|------|----------|
| [`createCheckoutOrder(request)`](#createcheckoutorder) | `POST` | `/v3/merchant-host/order/create` |
| [`initiateAccountLinking(request)`](#initiateaccountlinking) | `POST` | `/v3/merchant-host/account/link` |
| [`getAccessToken(request)`](#getaccesstoken) | `POST` | `/v3/merchant-host/access-token/get` |
| [`unlinkAccount(request)`](#unlinkaccount) | `POST` | `/v3/merchant-host/account/unlink` |
| [`getUserInfo(request)`](#getuserinfo) | `POST` | `/v3/merchant-host/user-info/get` |
| [`getCoinRedemptionInfo(request)`](#getcoinredemptioninfo) | `POST` | `/v3/merchant-host/coin/potential-redemption` |

#### Security / Utilities

| Method | Description |
|--------|-------------|
| [`signPayload(payload)`](#signpayload) | Generate HMAC-SHA256 signature |
| [`verifySignature(payload, signature)`](#verifysignature) | Verify a payload signature |
| [`verifyNotification(payload, signature)`](#verifynotification) | Verify & parse a notification payload |
| [`verifyWebhook(payload, signature)`](#verifywebhook) | Verify & parse a webhook event |

---

## Continuous Integration

This project uses [GitHub Actions](.github/workflows/ci.yml) for CI. The workflow runs on every push and pull request to `main`:

| Step | Description |
|------|-------------|
| `npm ci` | Install dependencies |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run unit tests |
| `npm run build` | Build ESM, CJS, and type declarations |

The CI matrix tests against **Node.js 18, 20, and 22**.

---

## Error Handling

The SDK throws a typed [`ShopeePayError`](src/shopeepay.ts:66) for non-2xx API responses:

```ts
import { ShopeePayModule, ShopeePayError } from "shopeepay-sdk";

try {
  await shopeePay.createCheckoutSession({ ... });
} catch (error) {
  if (error instanceof ShopeePayError) {
    console.error(`HTTP ${error.status}: ${error.statusText}`);
    console.error("Response body:", error.responseBody);
    console.error("Response headers:", error.responseHeaders);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

---

## TypeScript Types

All TypeScript interfaces are exported from `"shopeepay-sdk"`:

| Type | Description |
|------|-------------|
| `CreateCheckoutRequest` | V1 checkout session request |
| `CreateCheckoutResponse` | V1 checkout session response |
| `CheckoutStatusResponse` | V1 checkout status response |
| `CancelCheckoutResponse` | V1 cancel checkout response |
| `CreateRefundRequest` | V1 refund request |
| `CreateRefundResponse` | V1 refund response |
| `RefundStatusResponse` | V1 refund status response |
| `CreateCheckoutOrderRequest` | V3 checkout order request |
| `CreateCheckoutOrderResponse` | V3 checkout order response |
| `InitiateAccountLinkingRequest` | V3 account linking request |
| `InitiateAccountLinkingResponse` | V3 account linking response |
| `GetAccessTokenRequest` | V3 get access token request |
| `GetAccessTokenResponse` | V3 get access token response |
| `UnlinkAccountRequest` | V3 unlink account request |
| `UnlinkAccountResponse` | V3 unlink account response |
| `GetUserInfoRequest` | V3 get user info request |
| `GetUserInfoResponse` | V3 get user info response |
| `GetCoinRedemptionInfoRequest` | V3 coin redemption request |
| `GetCoinRedemptionInfoResponse` | V3 coin redemption response |
| `NotifyAccountLinkStatusPayload` | Account link callback payload |
| `ShopeePayWebhookEvent` | Generic webhook event |
| `ShopeePayV3Response` | Base V3 response schema |
| `ShopeePayClientOptions` | Client constructor options |
| `Region` | Supported regions: `ID`, `MY`, `PH`, `SG`, `TH`, `VN` |
| `Currency` | Supported currencies |
| `AllowedPaymentMethod` | Supported payment methods |
| `CheckoutStatus` | Checkout status enum |
| `PlatformType` | Platform type: `app`, `pc`, `mweb` |

---

## Publishing

```sh
# 1. Update version
npm version patch  # or minor / major

# 2. Run checks
npm test
npm run typecheck
npm run build

# 3. Publish
npm publish --access public
```

> Make sure to update [`package.json`](package.json) fields: `name`, `author`, `repository` before publishing.

---

## License

[MIT](LICENSE) © 2026 [phamkhanhminhman97](https://github.com/phamkhanhminhman97)
