import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  CancelCheckoutResponse,
  CheckoutStatusResponse,
  CreateCheckoutOrderRequest,
  CreateCheckoutOrderResponse,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  CreateRefundRequest,
  CreateRefundResponse,
  Environment,
  FetchLike,
  GetAccessTokenRequest,
  GetAccessTokenResponse,
  GetCoinRedemptionInfoRequest,
  GetCoinRedemptionInfoResponse,
  GetUserInfoRequest,
  GetUserInfoResponse,
  HttpMethod,
  InitiateAccountLinkingRequest,
  InitiateAccountLinkingResponse,
  RefundStatusResponse,
  Region,
  ShopeePayClientOptions,
  ShopeePayWebhookEvent,
  UnlinkAccountRequest,
  UnlinkAccountResponse
} from "./types.js";

const REGION_CODES: Record<Region, string> = {
  ID: "co.id",
  MY: "com.my",
  PH: "com.ph",
  SG: "sg",
  TH: "co.th",
  VN: "vn"
};

const HEADER_CLIENT_ID = "X-Airpay-ClientId";
const HEADER_SIGNATURE = "X-Airpay-Req-H";

export function buildBaseUrl(region: Region, environment: Environment = "sandbox"): string {
  const envSubdomain = environment === "production" ? "api.gw.airpay" : "api.gw.uat.airpay";
  return `https://${envSubdomain}.${REGION_CODES[region]}`;
}

export function stringifyBody(body: unknown): string {
  if (body === undefined || body === null) {
    return "";
  }

  return typeof body === "string" ? body : JSON.stringify(body);
}

export function createSignature(payload: string | Buffer, secretKey: string): string {
  return createHmac("sha256", secretKey).update(payload).digest("base64");
}

export function safeCompareSignatures(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

export class ShopeePayError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly responseBody: unknown;
  readonly responseHeaders: Headers;

  constructor(message: string, response: Pick<Response, "status" | "statusText" | "headers">, body: unknown) {
    super(message);
    this.name = "ShopeePayError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.responseBody = body;
    this.responseHeaders = response.headers;
  }
}

export class ShopeePayModule {
  private readonly clientId: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;

  constructor(options: ShopeePayClientOptions) {
    if (!options.clientId) {
      throw new TypeError("ShopeePay clientId is required.");
    }

    if (!options.secretKey) {
      throw new TypeError("ShopeePay secretKey is required.");
    }

    this.clientId = options.clientId;
    this.secretKey = options.secretKey;
    this.baseUrl = (options.baseUrl ?? buildBaseUrl(options.region, options.environment)).replace(/\/+$/, "");
    this.fetchImpl = options.fetch ?? fetch;
  }

  createCheckoutSession(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    return this.request<CreateCheckoutResponse>("POST", "/v1/checkout", request);
  }

  getCheckoutStatus(checkoutId: string): Promise<CheckoutStatusResponse> {
    return this.request<CheckoutStatusResponse>("GET", `/v1/checkout/${encodeURIComponent(checkoutId)}`);
  }

  createRefund(request: CreateRefundRequest): Promise<CreateRefundResponse> {
    return this.request<CreateRefundResponse>("POST", "/v1/refund", request);
  }

  getRefundStatus(refundId: string): Promise<RefundStatusResponse> {
    return this.request<RefundStatusResponse>("GET", `/v1/refund/${encodeURIComponent(refundId)}`);
  }

  cancelCheckout(checkoutId: string): Promise<CancelCheckoutResponse> {
    return this.request<CancelCheckoutResponse>("POST", `/v1/checkout/cancel/${encodeURIComponent(checkoutId)}`);
  }

  createCheckoutOrder(request: CreateCheckoutOrderRequest): Promise<CreateCheckoutOrderResponse> {
    return this.request<CreateCheckoutOrderResponse>("POST", "/v3/merchant-host/order/create", request);
  }

  initiateAccountLinking(request: InitiateAccountLinkingRequest): Promise<InitiateAccountLinkingResponse> {
    return this.request<InitiateAccountLinkingResponse>("POST", "/v3/merchant-host/account/link", request);
  }

  getAccessToken(request: GetAccessTokenRequest): Promise<GetAccessTokenResponse> {
    return this.request<GetAccessTokenResponse>("POST", "/v3/merchant-host/access-token/get", request);
  }

  unlinkAccount(request: UnlinkAccountRequest): Promise<UnlinkAccountResponse> {
    return this.request<UnlinkAccountResponse>("POST", "/v3/merchant-host/account/unlink", request);
  }

  getUserInfo(request: GetUserInfoRequest): Promise<GetUserInfoResponse> {
    return this.request<GetUserInfoResponse>("POST", "/v3/merchant-host/user-info/get", request);
  }

  getCoinRedemptionInfo(request: GetCoinRedemptionInfoRequest): Promise<GetCoinRedemptionInfoResponse> {
    return this.request<GetCoinRedemptionInfoResponse>(
      "POST",
      "/v3/merchant-host/coin/potential-redemption",
      request
    );
  }

  signPayload(payload: unknown): string {
    return createSignature(stringifyBody(payload), this.secretKey);
  }

  verifySignature(payload: unknown, signature: string): boolean {
    return safeCompareSignatures(this.signPayload(payload), signature);
  }

  verifyNotification<TPayload>(payload: unknown, signature: string): TPayload {
    if (!this.verifySignature(payload, signature)) {
      throw new Error("Invalid ShopeePay webhook signature.");
    }

    if (typeof payload === "string") {
      return JSON.parse(payload) as TPayload;
    }

    return payload as TPayload;
  }

  verifyWebhook<TData = unknown>(payload: unknown, signature: string): ShopeePayWebhookEvent<TData> {
    return this.verifyNotification<ShopeePayWebhookEvent<TData>>(payload, signature);
  }

  private async request<TResponse>(method: HttpMethod, path: string, body?: unknown): Promise<TResponse> {
    const serializedBody = stringifyBody(body);
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        [HEADER_CLIENT_ID]: this.clientId,
        [HEADER_SIGNATURE]: createSignature(serializedBody, this.secretKey)
      },
      body: method === "GET" ? undefined : serializedBody
    });

    const rawText = await response.text();
    const parsedBody = parseJson(rawText);

    if (!response.ok) {
      throw new ShopeePayError(
        `ShopeePay API request failed with HTTP ${response.status}.`,
        response,
        parsedBody
      );
    }

    const responseSignature = response.headers.get(HEADER_SIGNATURE);
    if (responseSignature && !safeCompareSignatures(createSignature(rawText, this.secretKey), responseSignature)) {
      throw new Error("Invalid ShopeePay response signature.");
    }

    return parsedBody as TResponse;
  }
}

export const ShopeePayClient = ShopeePayModule;
export const ShopeePay = ShopeePayModule;

function parseJson(rawText: string): unknown {
  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return rawText;
  }
}
