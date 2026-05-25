# Implementation Plan - ShopeePay SDK Upgrade (V3 & Monorepo Alignment)

This plan outlines the design and implementation updates for the `shopeepay-sdk` package. 

We will align the naming conventions with your other platform SDKs (`ShopeeModule`, `LazadaModule`, `TiktokModule`) and add complete support for the newly documented **V3 Merchant-Host APIs** (Checkout Order and Account Linking).

## User Review Required

> [!IMPORTANT]
> Please review the proposed architecture and naming changes before we proceed to execution.

1. **Naming Alignment**:
   We will rename the main class `ShopeePayClient` to **`ShopeePayModule`** in `src/shopeepay.ts` to follow your monorepo's design pattern exactly. We will retain `ShopeePayClient` as a backward-compatible alias.

2. **Complete V3 Merchant-Host APIs Support**:
   We will implement all the missing V3 endpoints described in `docs/checkout.md` and `docs/account-linking.md` inside `ShopeePayModule`:
   - `createCheckoutOrder(request)` -> `POST /v3/merchant-host/order/create`
   - `initiateAccountLinking(request)` -> `POST /v3/merchant-host/account/link`
   - `getAccessToken(request)` -> `POST /v3/merchant-host/access-token/get`
   - `unlinkAccount(request)` -> `POST /v3/merchant-host/account/unlink`
   - `getUserInfo(request)` -> `POST /v3/merchant-host/user-info/get`
   - `getCoinRedemptionInfo(request)` -> `POST /v3/merchant-host/coin/potential-redemption`

---

## Proposed Changes

### 1. Types Definitions

#### [MODIFY] [types.ts](file:///Users/man/Documents/shopeepay-sdk/src/types.ts)
Add typescript interfaces for all V3 requests and responses:
- `CreateCheckoutOrderRequest` & `CreateCheckoutOrderResponse`
- `InitiateAccountLinkingRequest` & `InitiateAccountLinkingResponse`
- `GetAccessTokenRequest` & `GetAccessTokenResponse`
- `UnlinkAccountRequest` & `UnlinkAccountResponse`
- `GetUserInfoRequest` & `GetUserInfoResponse`
- `GetCoinRedemptionInfoRequest` & `GetCoinRedemptionInfoResponse`
- `NotifyAccountLinkStatusPayload`

---

### 2. Core Source Code

#### [MODIFY] [shopeepay.ts](file:///Users/man/Documents/shopeepay-sdk/src/shopeepay.ts)
- Rename `ShopeePayClient` class to `ShopeePayModule`.
- Export `ShopeePayClient` as a backward-compatible alias.
- Add implementations for all 6 V3 API methods using the existing private signed `request` method.

#### [MODIFY] [index.ts](file:///Users/man/Documents/shopeepay-sdk/src/index.ts)
Export the new `ShopeePayModule` class, aliases, and all the new V3 TypeScript interfaces.

---

### 3. Verification & Testing

#### [MODIFY] [test/shopeepay.test.ts](file:///Users/man/Documents/shopeepay-sdk/test/shopeepay.test.ts)
- Update unit tests to use `ShopeePayModule`.
- Add test assertions for `ShopeePay` alias equality.
- Add robust mock tests verifying V3 request layouts, computed headers, signatures, and parsed response payloads.

---

## Verification Plan

### Automated Tests
Run Vitest to verify all endpoints compute signatures, headers, and serialize bodies correctly:
```bash
npm run test
```

### Build Check
Verify compilation ESM, CommonJS, and declaration files:
```bash
npm run build
```
