export type Environment = "sandbox" | "production";

export type Region = "ID" | "MY" | "PH" | "SG" | "TH" | "VN";

export type Currency = "IDR" | "MYR" | "PHP" | "SGD" | "THB" | "VND";

export type AllowedPaymentMethod =
  | "spp_wallet"
  | "spay_later"
  | "bank_transfer"
  | "bank_transfer.bri"
  | "bank_transfer.seabank"
  | "bank_transfer.bni"
  | "bank_transfer.others"
  | "card"
  | "online_banking"
  | "maribank_direct_debit"
  | "qris"
  | "promptpay_qr"
  | "viet_qr"
  | "duitnow_qr"
  | "qrph"
  | (string & {});

export type CheckoutStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "successful"
  | "settled"
  | "Active"
  | "Expired"
  | "Cancelled"
  | "Successful"
  | "Settled";

export type RefundStatus = "pending" | "succeeded" | "failed" | "successful" | (string & {});

export type HttpMethod = "GET" | "POST";

export type FetchLike = (
  input: string | URL,
  init?: RequestInit
) => Promise<Pick<Response, "ok" | "status" | "statusText" | "headers" | "text">>;

export interface ShopeePayClientOptions {
  clientId: string;
  secretKey: string;
  region: Region;
  environment?: Environment;
  baseUrl?: string;
  fetch?: FetchLike;
}

export type ShopeePayModuleOptions = ShopeePayClientOptions;

export interface Customer {
  name?: string;
  postal_code?: string;
  phone_number?: string;
  email?: string;
  address?: string;
}

export interface CheckoutItem {
  name: string;
  quantity: number;
  price: number;
  description?: string;
  category?: "fee" | "discount" | (string & {});
}

export interface CreateCheckoutRequest {
  reference_id: string;
  merchant_ext_id: string;
  store_ext_id?: string;
  amount: number;
  currency: Currency;
  return_url: string;
  validity_period?: number;
  locale?: string;
  allowed_payment_method?: AllowedPaymentMethod[];
  customer?: Customer;
  items?: CheckoutItem[];
  [key: string]: unknown;
}

export interface CreateCheckoutResponse {
  reference_id: string;
  checkout_url: string;
  checkout_id: string;
  created_at: string;
  expires_at: string;
  [key: string]: unknown;
}

export interface CheckoutDetails extends Omit<CreateCheckoutRequest, "validity_period"> {
  expiry_time?: string | number;
  [key: string]: unknown;
}

export interface CheckoutStatusResponse {
  checkout_id: string;
  status: CheckoutStatus;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  checkout_details: CheckoutDetails;
  [key: string]: unknown;
}

export interface CreateRefundRequest {
  original_checkout_id: string;
  refund_reference_id: string;
  amount: number;
  [key: string]: unknown;
}

export interface CreateRefundResponse {
  refund_id: string;
  original_checkout_id: string;
  refund_reference_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
  status: RefundStatus;
  [key: string]: unknown;
}

export interface RefundStatusResponse {
  refund_id: string;
  amount?: number;
  status: RefundStatus;
  created_at: string;
  updated_at: string;
  refund_session_details: {
    refund_reference_id: string;
    original_checkout_id: string;
    amount: number;
    currency: Currency | (string & {});
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface CancelCheckoutResponse {
  checkout_id: string;
  created_at: string;
  updated_at: string;
  checkout_details: CheckoutDetails;
  [key: string]: unknown;
}

export type PlatformType = "app" | "pc" | "mweb" | (string & {});

export interface ShopeePayV3Response {
  request_id: string;
  errcode: number;
  debug_msg: string;
  [key: string]: unknown;
}

export interface CreateCheckoutOrderRequest {
  request_id: string;
  payment_reference_id: string;
  merchant_ext_id: string;
  store_ext_id: string;
  amount: number;
  currency: Currency;
  return_url: string;
  platform_type: PlatformType;
  validity_period?: number;
  expiry_time?: number;
  promo_ids?: string;
  additional_info?: string;
  phone?: string;
  preferred_payment_method_type?: "spp_wallet" | "spay_later" | "maribank_direct_debit" | (string & {});
  [key: string]: unknown;
}

export interface CreateCheckoutOrderResponse extends ShopeePayV3Response {
  redirect_url_http?: string;
  qr_content?: string;
  qr_url?: string;
}

export interface InitiateAccountLinkingRequest {
  request_id: string;
  return_url: string;
  linking_reference_id?: string;
  merchant_ext_id: string;
  service_name?: string;
  service_id?: string;
  linking_description?: string;
  phone: string;
  platform_type?: PlatformType;
  additional_info?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface InitiateAccountLinkingResponse extends ShopeePayV3Response {
  redirect_url_web?: string;
}

export interface GetAccessTokenRequest {
  request_id: string;
  linking_reference_id: string;
  [key: string]: unknown;
}

export interface AccountLinkingTokenResponse extends ShopeePayV3Response {
  access_token?: string;
  user_id_hash?: string;
  merchant_ext_id?: string;
  linking_reference_id?: string;
  linking_status?: number;
  create_time?: number | string;
  update_time?: number | string;
}

export type GetAccessTokenResponse = AccountLinkingTokenResponse;

export interface UnlinkAccountRequest {
  request_id: string;
  linking_reference_id: string;
  [key: string]: unknown;
}

export type UnlinkAccountResponse = AccountLinkingTokenResponse;

export interface GetUserInfoRequest {
  request_id: string;
  access_token: string;
  [key: string]: unknown;
}

export interface LinkingInfo {
  linking_status: number;
  create_time: number | string;
  update_time: number | string;
  user_id_hash: string;
  linking_reference_id: string;
  merchant_ext_id: string;
  [key: string]: unknown;
}

export interface UserInfo {
  wallet_balance?: number;
  spaylater_info?: {
    available_balance?: number;
    status_info?: string;
    [key: string]: unknown;
  };
  kyc_passed?: boolean;
  [key: string]: unknown;
}

export interface GetUserInfoResponse extends ShopeePayV3Response {
  linking_info?: LinkingInfo;
  user_info?: UserInfo;
}

export interface GetCoinRedemptionInfoRequest {
  request_id: string;
  access_token: string;
  payment_amount?: number;
  [key: string]: unknown;
}

export interface GetCoinRedemptionInfoResponse extends ShopeePayV3Response {
  max_coin_percentage?: number;
  potential_payment_amount?: number;
  potential_coin_amount?: number;
}

export interface NotifyAccountLinkStatusPayload {
  request_id: string;
  linking_reference_id: string;
  merchant_ext_id: string;
  update_type: 1 | 2 | 3 | 4 | 5 | number;
  [key: string]: unknown;
}

export type ShopeePayWebhookEventType =
  | "checkout.successful"
  | "checkout.expired"
  | "checkout.cancelled"
  | "refund.successful"
  | "refund.failed"
  | (string & {});

export interface ShopeePayWebhookEvent<TData = unknown> {
  event_type: ShopeePayWebhookEventType;
  event_id: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
  data: TData;
  [key: string]: unknown;
}
