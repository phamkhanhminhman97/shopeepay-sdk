# shopeepay-sdk

TypeScript SDK for ShopeePay Payment Gateway APIs.

## Install

```sh
npm install shopeepay-sdk
```

## Usage

```ts
import { ShopeePayClient } from "shopeepay-sdk";

const shopeePay = new ShopeePayClient({
  clientId: process.env.SHOPEEPAY_CLIENT_ID!,
  secretKey: process.env.SHOPEEPAY_SECRET_KEY!,
  region: "VN",
  environment: "sandbox"
});

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
    {
      name: "Product A",
      quantity: 1,
      price: 100000
    }
  ],
  customer: {
    name: "Nguyen Van A",
    email: "customer@example.com",
    phone_number: "+84901234567"
  }
});

console.log(checkout.checkout_url);
```

## V3 merchant-host checkout

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

console.log(order.redirect_url_http);
```

Redirect customers to `redirect_url_http`, then rely on ShopeePay callback or a server-side status check before marking the order as paid. Do not treat the customer return URL as proof of payment.

## V3 account linking

```ts
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

console.log(link.redirect_url_web);

const token = await shopeePay.getAccessToken({
  request_id: "token-request-1001",
  linking_reference_id: "customer-1001-shopeepay"
});

const user = await shopeePay.getUserInfo({
  request_id: "user-info-1001",
  access_token: token.access_token!
});
```

The linking flow can be completed from the ShopeePay callback or from the frontend return message. Store `access_token` securely on your server only.

## API

```ts
const client = new ShopeePayClient({
  clientId: "...",
  secretKey: "...",
  region: "ID" | "MY" | "PH" | "SG" | "TH" | "VN",
  environment: "sandbox" | "production"
});
```

Methods:

- `createCheckoutSession(request)`
- `getCheckoutStatus(checkoutId)`
- `createRefund(request)`
- `getRefundStatus(refundId)`
- `cancelCheckout(checkoutId)`
- `createCheckoutOrder(request)`
- `initiateAccountLinking(request)`
- `getAccessToken(request)`
- `unlinkAccount(request)`
- `getUserInfo(request)`
- `getCoinRedemptionInfo(request)`
- `signPayload(payload)`
- `verifySignature(payload, signature)`
- `verifyWebhook(payload, signature)`

## Webhook verification

Use the raw request body if your HTTP framework exposes it. The signature must be read from `X-Airpay-Req-H`.

```ts
const event = shopeePay.verifyWebhook(rawBody, req.headers["x-airpay-req-h"]);

if (event.event_type === "checkout.successful") {
  // Mark the order as paid after checking your own order reference.
}
```

## Publish to npm

```sh
npm install
npm test
npm run typecheck
npm run build
npm publish --access public
```

Set `package.json` `name`, `author`, `repository`, and `version` before publishing.
