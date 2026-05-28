import { describe, expect, it, vi } from "vitest";
import {
  ShopeePay,
  ShopeePayClient,
  ShopeePayError,
  ShopeePayModule,
  buildBaseUrl,
  createSignature
} from "../src/index.js";

describe("ShopeePay SDK", () => {
  it("builds environment URLs", () => {
    expect(buildBaseUrl("VN", "sandbox")).toBe("https://api.gw.uat.airpay.vn");
    expect(buildBaseUrl("SG", "production")).toBe("https://api.gw.airpay.sg");
  });

  it("keeps backward-compatible class aliases", () => {
    expect(ShopeePayClient).toBe(ShopeePayModule);
    expect(ShopeePay).toBe(ShopeePayModule);
  });

  it("creates HMAC SHA-256 base64 signatures", () => {
    expect(createSignature("what do ya want for nothing?", "Jefe")).toBe("W9zBRr9gdU5qBCQmCJV1x1oAPwidJzmDnexYuWTsOEM=");
  });

  it("sends signed checkout requests", async () => {
    const fetchMock = vi.fn(async (_input: string | URL, _init?: RequestInit) => {
      return new Response(
        JSON.stringify({
          reference_id: "webhost210",
          checkout_url: "https://example.com/checkout",
          checkout_id: "SPP-123",
          created_at: "2026-04-20T10:39:54+07:00",
          expires_at: "2026-04-20T12:39:54+07:00"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const client = new ShopeePayModule({
      clientId: "client-id",
      secretKey: "secret",
      region: "ID",
      fetch: fetchMock
    });

    const result = await client.createCheckoutSession({
      reference_id: "webhost210",
      merchant_ext_id: "merchant",
      amount: 100000,
      currency: "IDR",
      return_url: "https://merchant.example/return"
    });

    expect(result.checkout_id).toBe("SPP-123");
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.gw.uat.airpay.co.id/v1/checkout");
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>)["X-Airpay-ClientId"]).toBe("client-id");
    expect((init?.headers as Record<string, string>)["X-Airpay-Req-H"]).toBe(
      createSignature(init?.body as string, "secret")
    );
  });

  it("throws typed errors for non-2xx responses", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ error: "invalid_parameter" }), {
        status: 400,
        statusText: "Bad Request",
        headers: { "Content-Type": "application/json" }
      });
    });

    const client = new ShopeePayClient({
      clientId: "client-id",
      secretKey: "secret",
      region: "ID",
      fetch: fetchMock
    });

    await expect(client.getCheckoutStatus("SPP-404")).rejects.toBeInstanceOf(ShopeePayError);
  });

  it("verifies both payment webhooks and account-link notifications", () => {
    const client = new ShopeePayModule({
      clientId: "client-id",
      secretKey: "secret",
      region: "ID"
    });

    const paymentPayload =
      '{"event_type":"checkout.successful","event_id":"evt-1","timestamp":"2026-05-25T10:00:00+07:00","created_at":"2026-05-25T09:59:00+07:00","updated_at":"2026-05-25T10:00:00+07:00","data":{"checkout_id":"SPP-1"}}';
    const accountLinkPayload =
      '{"request_id":"req-link","linking_reference_id":"link-ref-1","merchant_ext_id":"merchant","update_type":1}';

    const paymentEvent = client.verifyWebhook(paymentPayload, createSignature(paymentPayload, "secret"));
    const accountLinkEvent = client.verifyNotification<{ linking_reference_id: string; update_type: number }>(
      accountLinkPayload,
      createSignature(accountLinkPayload, "secret")
    );

    expect(paymentEvent.event_type).toBe("checkout.successful");
    expect(accountLinkEvent.linking_reference_id).toBe("link-ref-1");
    expect(accountLinkEvent.update_type).toBe(1);
  });

  it("sends signed V3 checkout order requests", async () => {
    const fetchMock = createJsonFetchMock({
      request_id: "req-1",
      errcode: 0,
      debug_msg: "success",
      redirect_url_http: "https://id.shp.ee/sppay_checkout_id"
    });

    const client = new ShopeePayModule({
      clientId: "client-id",
      secretKey: "secret",
      region: "ID",
      fetch: fetchMock
    });

    const response = await client.createCheckoutOrder({
      request_id: "req-1",
      payment_reference_id: "pay-ref-1",
      merchant_ext_id: "merchant",
      store_ext_id: "store",
      amount: 10000,
      currency: "IDR",
      return_url: "https://merchant.example/return",
      platform_type: "app",
      preferred_payment_method_type: "spay_later"
    });

    expect(response.redirect_url_http).toBe("https://id.shp.ee/sppay_checkout_id");
    expectSignedRequest(fetchMock, "/v3/merchant-host/order/create", "secret");
  });

  it("sends signed V3 account linking requests", async () => {
    const fetchMock = createJsonFetchMock({
      request_id: "req-link",
      errcode: 0,
      debug_msg: "success",
      redirect_url_web: "https://app.uat.shopeepay.vn/universal-link/payment/account-linking/pre-link"
    });

    const client = new ShopeePayModule({
      clientId: "client-id",
      secretKey: "secret",
      region: "VN",
      fetch: fetchMock
    });

    const response = await client.initiateAccountLinking({
      request_id: "req-link",
      return_url: "https://merchant.example/linking/callback",
      linking_reference_id: "link-ref-1",
      merchant_ext_id: "merchant",
      service_name: "merchant-name",
      service_id: "service-id",
      linking_description: "Bind ShopeePay wallet",
      phone: "84981234567",
      platform_type: "mweb"
    });

    expect(response.redirect_url_web).toContain("account-linking");
    expectSignedRequest(fetchMock, "/v3/merchant-host/account/link", "secret", 0, "https://api.gw.uat.airpay.vn");
  });

  it("sends signed V3 token, unlink, user info, and coin redemption requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ request_id: "req-token", errcode: 0, debug_msg: "success", access_token: "token" }))
      .mockResolvedValueOnce(jsonResponse({ request_id: "req-user", errcode: 0, debug_msg: "success", user_info: { kyc_passed: true } }))
      .mockResolvedValueOnce(
        jsonResponse({
          request_id: "req-coin",
          errcode: 0,
          debug_msg: "success",
          max_coin_percentage: 10,
          potential_payment_amount: 10000,
          potential_coin_amount: 30
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          request_id: "req-unlink",
          errcode: 0,
          debug_msg: "success",
          linking_reference_id: "link-ref-1",
          linking_status: 3
        })
      );

    const client = new ShopeePayModule({
      clientId: "client-id",
      secretKey: "secret",
      region: "ID",
      fetch: fetchMock
    });

    await expect(client.getAccessToken({ request_id: "req-token", linking_reference_id: "link-ref-1" })).resolves.toMatchObject({
      access_token: "token"
    });
    await expect(client.getUserInfo({ request_id: "req-user", access_token: "token" })).resolves.toMatchObject({
      user_info: { kyc_passed: true }
    });
    await expect(
      client.getCoinRedemptionInfo({ request_id: "req-coin", access_token: "token", payment_amount: 10000 })
    ).resolves.toMatchObject({
      potential_coin_amount: 30
    });
    await expect(client.unlinkAccount({ request_id: "req-unlink", linking_reference_id: "link-ref-1" })).resolves.toMatchObject({
      linking_status: 3
    });

    expectSignedRequest(fetchMock, "/v3/merchant-host/access-token/get", "secret", 0);
    expectSignedRequest(fetchMock, "/v3/merchant-host/user-info/get", "secret", 1);
    expectSignedRequest(fetchMock, "/v3/merchant-host/coin/potential-redemption", "secret", 2);
    expectSignedRequest(fetchMock, "/v3/merchant-host/account/unlink", "secret", 3);
  });
});

function createJsonFetchMock(body: unknown) {
  return vi.fn(async () => jsonResponse(body));
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

function expectSignedRequest(
  fetchMock: ReturnType<typeof vi.fn>,
  path: string,
  secretKey: string,
  callIndex = 0,
  baseUrl = "https://api.gw.uat.airpay.co.id"
) {
  const [url, init] = fetchMock.mock.calls[callIndex]!;
  const headers = init?.headers as Record<string, string>;

  expect(url).toBe(`${baseUrl}${path}`);
  expect(init?.method).toBe("POST");
  expect(headers["X-Airpay-ClientId"]).toBe("client-id");
  expect(headers["X-Airpay-Req-H"]).toBe(createSignature(init?.body as string, secretKey));
}
