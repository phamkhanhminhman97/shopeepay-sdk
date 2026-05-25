ShopeePay Payment Gateway
Merchant Workflow

Create a checkout session when customers proceed to pay

Obtain and handle redirect URL to AirPay hosted web page

Handle notification callback or query payment results

Trigger refund of successful payment upon confirmation with customer

The following figure illustrates the workflow of accepting a payment in the ShopeePay Payment Gateway payment scenario:

After customer selects goods/services and clicks Checkout, merchant backend creates a checkout session by calling ShopeePay's Create checkout session endpoint.
Customer is redirected to either ShopeePay website to proceed with payment. In case only ShopeePay/SPayLater/Seabank Direct Debit is passed under allowed_payment_method , customer might be able to open Shopee/ShopeePay application directly.
Upon landing on ShopeePay hosted page, customers will be able to confirm payment details (payment amount), select preferred payment method, and apply any relevant promotion.
Once customer selects payment method and authorizes payment successfully, ShopeePay will process and payment redirect users to transaction result page. If transaction result is successful, ShopeePay will also notify merchant via provided callback url.
Customer is then redirected back to the merchant's page to view payment status, as specified by the merchant in the redirect_url of the Create Checkout endpoint. Redirect to return_url_http should never be used as an indication of payment success. The Merchant should only rely on the server request response to check the final status of payment.
Merchant can also utilize Get Checkout Status endpoint to query payment status
If the returned enum is Successful, merchant can mark this transaction as successful
If the returned enum is Expired or Cancelled, merchant mark this transaction as failed.
If the returned enum is Active, merchant can take this as payment is still under processing. Merchant is advised to request at an incremental time range of every 5 seconds (e.g., 5 seconds, 10 seconds, 15 seconds, and so on) up to a maximum of 100 seconds. If there is no terminal status after 100 seconds, please retry the request at an incremental time range of every 5 minutes up to 24 hours. Alternatively, merchants can call the Cancel Checkout endpoint to terminate the transaction.
API Documentation
Getting started
Create Checkout Session
Get Checkout Status
Create Refund
Get Refund Status
Cancel Checkout
Getting started with ShopeePay Payment gateway
Prerequisite
Merchant should fulfil the following requirements to interact with ShopeePay APIs:

To be compatible with OAuth 2.0 protocol and HMAC used by ShopeePay to authorize calls.
Merchants should use TLSv1.2 or TLSv1.3 for TLS handshake.
Merchants should integrate directly with ShopeePay endpoints without the use of a SDK.
Onboarding
Once the commercial agreement between partner and ShopeePay is finalized, each merchant will be assigned the following credentials for integration testing purposes:

Credentials	Description
Client ID	Client refers to the party that integrate with ShopeePAy APIs. Each client is assigned a unique identifier known as the Client ID, and this Client ID must be included in the request header of every API call made to ShopeePay services.
Secret Key	A secret key that is shared between ShopeePay server and partner. This key is used to generate the signature to authenticate the partner. When handling sensitive information such as merchant ID and secret key, please do not hard code the secret key in a frontend application. All API calls should only be made from the partner’s servers.
Access nodes
ShopeePay gateway access nodes are country specific, each country will have their own API domains to be called.

Region	Abbreviation	Region Code
Indonesia	ID	co.id
Malaysia	MY	com.my
Philippines	PH	com.ph
Singapore	SG	sg
Thailand	TH	co.th
Vietnam	VN	vn
Environment	Domain
Sandbox	api.gw.uat.airpay.<region code>
Production	api.gw.airpay.<region code>
API Protocol Rules
The below specifies the rules for calling ShopeePay APIs:

Component	Format/ Method
Transfer mode	HTTPS
Submit mode	POST Method
Date format	UNIX (seconds)
Char Encoding	UTF-8
Signature	HMAC, SHA-256, Base64
API Parameters Specification
Request header
All requests will require the following parameter

Name	Description
client_id	Client refers to the party that integrate with ShopeePay APIs. Each client is assigned a unique identifier known as the Client ID, and this Client ID must be included in the request header of every API call made to ShopeePay's services.
signature	Generated using the shared secret that is given by Shopee to authenticate the API caller.
Request response
The ShopeePay API response body is in JSON format.

Considerations to take note of in the response body:

Parameters can be returned in a random sequence.
Empty parameters may be returned in the following format by default, unless stated otherwise.
Additional parameters may be returned in future without advance notice from ShopeePay.
Merchant system’s logic must not assume that the order of arrangement of response parameters or the total number of parameters returned will remain constant throughout time.
Type	Empty Response
Integer	0
String	Empty string or "0" if the field represent a numerical value
Object	null
Array	Empty array
Boolean	False
URL Query Parameters
The URL query parameters can be returned in a random sequence.
Additional query parameters may be added in the future without advance notice from ShopeePay.
Query parameters are case-sensitive.
Security Specifications
Generate HMAC Signature
Signature generation is essential for authenticating API requests between ShopeePay and the merchant. The signature is generated using a confidential shared secret key and algorithm, provided by ShopeePay. Merchants may use the common signature modes such as hash-based message authentication code (HMAC), SHA-256, and Base64.

GO EXAMPLE
import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/base64"
)
// Sign - sign the `payload` with `key`
func Sign(payload, key []byte) string {
  mac := hmac.New(sha256.New, key)
  // Cannot return error
  if _, err := mac.Write(payload); err != nil {
      return ""
  }
  return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

arrow-svg
Copy

JS EXAMPLE
let hash = CryptoJS.HmacSHA256(body, secret)
let sig = CryptoJS.enc.Base64.stringify(hash).replace(/\n+$/, '')


arrow-svg
Copy

Steps to Generate HMAC Signatures
If the request has a body, the request body must be hashed using the SHA-256 algorithm and represented as a base-64 encoded value. To generate a signature, the HTTP request body is hashed using HMAC with the SHA-256 algorithm and the shared secret key, operated on the request JSON to ensure authenticity of the request.

For example, secret: pz148x0gXyPCLHxnlhEydNLg55jni91i

Extract the request body to be signed:
JS EXAMPLE
{"request_id": "","store_ext_id": "externalstore","merchant_ext_id": "externalmerchant","amount": 1000,"terminal_id": "terminal","convenience_fee_percentage": 0,"convenience_fee_fixed": 0,"convenience_fee_indicator": "","additional_info": "","currency": "IDR","qr_validity_period": 1000,"payment_reference_id": "testreference"}

arrow-svg
Copy

Hash the JSON content by using the SHA256 algorithm
JS EXAMPLE
5f5532bf23018674788770f43743522dff1af5782243fab06b1e8677a7391d4c

arrow-svg
Copy

Encode to Base64
JS EXAMPLE
X1UyvyMBhnR4h3D0N0NSLf8a9XgiQ/qwax6Gd6c5HUw=

arrow-svg
Copy

Signature validation
Upon receiving the API response, the Merchant should validate the signature of the response:

Use the shared secret to sign the response body to obtain the response signature.
Compare the generated signature to the signature in the header of the API response.
Signatures from steps #1 and #2 must be identical. If they are different, the response should not be trusted.
To assist with signature validation, you can use online tools such as base64encode.org. These tools provide a convenient way to decode and verify signatures during the API integration process.

Request Header
Include the signature in the request. The signature should be added in the HTTP header in the following format:

SH EXAMPLE
X-Airpay-ClientId: <clientid>
X-Airpay-Req-H: <request_signature>

arrow-svg
Copy

Backward Compatible Changes
Backward compatible or non-breaking changes refer to API changes that allow the integration to continue using the API without any additional changes required at Merchant’s side. ShopeePay may make such changes on their sole discretion without informing the existing Merchants in advance, as such changes are deemed to not break any integration implemented by the Merchant.

ShopeePay considers the following changes as non-breaking:

Add new API resource or new types of server callback to a new endpoint.
Add new or remove optional field to existing API request parameters.
Add new fields to existing API response/server callback parameters.
Increase or decrease the max length limit of existing fields on existing API response / server callback parameters.
Change the order of fields in existing API responses or server callback parameters.
Increase the max length limit of request fields on existing API request parameters.
Create Checkout Session
Use this endpoint to create a checkout session. This is required to obtain ShopeePay redirection url.

URL: "/v1/checkout"
Request parameter
reference_id
string
Required
Unique identifier of transaction generated by merchant. Max 64 characters
merchant_ext_id
string
Required
Currency associated with the payment amount.

Possible values:

Indonesia: IDR
Malaysia: MYR
Philipines: PHP
Singapore: SGD
Thailand: THB
Vietnam: VND
return_url
string
Required
Indicates the URL (in HTTP links or URL scheme formats) of the merchant’s application to redirect back to once the payment is processed or when the customer canceled the payment.
validity_period
uint32
By default, the expiry time will be set to 1200 seconds (20 minutes), from the time the request was received. If this field is passed, the checkout with the corresponding reference_id in this request will expire after the specified time period (in seconds) and payment attempts to this reference_id will fail. Max expiry accepted is 1 day (86400 seconds).
locale
string
IETF language tag of the checkout is displayed in.

Indonesia:id/en
Malaysia: ms/en/zh-CN
Philippines: en/fil
Singapore: en/ms-SG/zh-SG/ ta-SG
Thailand: en/th
Vietnam: en/vi
allowed_payment_method
string
Specify the list of payment channels for your customers to select

spp_wallet: refers to ShopeePay wallet, available in all markets
spay_later: refers to SPayLater, available in all markets
bank_transfer: available in ID and VN. In ID, it is possible to specify the following banks: bank_transfer.bri- BRI, bank_transfer.seabank - Seabank, bank_transfer.bni - BNI, bank_transfer.others - Other banks
card: refers to international credit cards. Accepted in all markets
online_banking: only available in MY
maribank_direct_debit: only available PH
Pass the following for National QR payment: ID - qris, "TH": promptpay_qr, "VN": viet_qr, "MY": duitnow_qr, "PH": qrph
customer
string
Customer account information in merchant account system
Show child child parameters
item
object
Detailed information about the checkout items
Show child child parameters
Sample request
JS EXAMPLE
{
    "reference_id": "webhost165",
    "merchant_ext_id": "testxxxpg",
    "store_ext_id": "testxxx",
    "amount": 100000,
    "currency": "IDR",
    "return_url": "https://www.google.com",
    "validity_period": 7200,
    "allowed_payment_method": [
        "spay_later"
    ],
    "items": [
        {
            "name": "item1",
            "quantity": 1,
            "price": 100000
        },
        {
            "name": "shipping",
            "quantity": 1,
            "price": 100,   
            "category": "fee"
        },
        {
            "name": "discount",
            "quantity": 1,
            "price": -100,
            "category": "discount"
        }
    ],
    "customer": {
        "name": "john cena",
        "postal_code": "12345",
        "phone_number": "00810029200006",
        "email": "test@test.com"
    }
}

arrow-svg
Copy

Response Parameter
reference_id
string
Required
Unique identifier of transaction generated by merchant.
expires_at
string(date-time)
Required
The timestamp at which the payment session will expired
created_at
string(date-time)
Required
The timestamp at which the payment session is created
checkout_url
string
Required
The url of the payment sessions. Use this url to redirect the customer to ShopeePay Web Hosted page
checkout_id
string
Required
A unique identifier of the payment session
Sample response
JS EXAMPLE
{
    "reference_id": "webhost210",
    "checkout_url": "https://app.test.shopeepay.co.id/u/pay_checkout?type=start&mid=101118779&target_app=shopeepay&_apprl_=%2Frn%2F%40shopee-rn%2Fshopeepay%2FTRANSFER_PAYMENT_SELECTION_CSCANB%3F__anim__%3D2%26entryRefer%3DJumpApp%26mid%3D101118779%26order_key%3DoZu5W5BtnTNN2H3PyD6D2pW2Z8zbg76_XrImjmKjGagP0TLt9YhrThUyIQlzpHS_SgCeh5-26h0ecg%26order_sn%3D110935773598896173%26referrer%3Dexternal%26return_url%3DaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbT9hbW91bnQ9MTAwMDAwJmNsaWVudF9pZD14eHgrdGVzdCtwZytzeW5jK2VzMjIyJnJlZmVyZW5jZV9pZD13ZWJob3N0MjEwJnJlc3VsdF9jb2RlPTIwMyZzaWduYXR1cmU9YUFQTWhEc2IxZlVlaDRFdS1Od29xM2pLUHFIOGpMTG1GanQzcnlHMlJjNCUzRA%253D%253D%26source%3Dweb%26token%3Dxd7iq02mfq15cfhldd1cg&medium_index=xd7iq02mfq15cfhldd1cg&order_key=oZu5W5BtnTNN2H3PyD6D2pW2Z8zbg76_XrImjmKjGagP0TLt9YhrThUyIQlzpHS_SgCeh5-26h0ecg&order_sn=110935773598896173&phone=00810029200006&return_url=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbT9hbW91bnQ9MTAwMDAwJmNsaWVudF9pZD14eHgrdGVzdCtwZytzeW5jK2VzMjIyJnJlZmVyZW5jZV9pZD13ZWJob3N0MjEwJnJlc3VsdF9jb2RlPTIwMyZzaWduYXR1cmU9YUFQTWhEc2IxZlVlaDRFdS1Od29xM2pLUHFIOGpMTG1GanQzcnlHMlJjNCUzRA%3D%3D&source=web&target=2&token=xd7iq02mfq15cfhldd1cg",
    "checkout_id": "SPP-MTEwOTM1NzczNTk4ODk2MTcz",
    "created_at": "2026-04-20T10:39:54+07:00",
    "expires_at": "2026-04-20T12:39:54+07:00"
}

arrow-svg
Copy

Response code
Refer to following table for HTTP error code:

Status code	Error code	Description
200		Success
400	invalid_parameter	Missing parameters or parameters are not in the correct format
400	invalid_mandatory_parameter	Missing mandatory parameters or mandatory parameters are not in the correct format
400	payment_method_unsupported	Merchant provides payment methods that are not supported by Gateway Service
400	invalid_total_amount	Sum (items.price x items.quantity) + fee - discount does not match with amount
400	invalid_amount	Amount is too large / Amount is too small / Parameters are not in the correct format
401	Unauthorized	Unauthorized. Invalid Client Key
403	feature_not_allowed	Merchant does not access to the checkout API/ No payment channel is enabled for this merchant/ Gateway Service is under maintenance
404	invalid_merchant / invalid_store	Merchant does not exist or merchant status is abnormal/ Store does not exist or merchant status is abnormal
409	duplicate_reference_id	CheckoutID has previously been processed using the same referenceID
500	general_error	Any other technical errors
Get Checkout ID Status
Request parameter:
Use the following path to obtain the latest status GET /v1/checkout/:checkout_id where checkout_id is provided in the response of create checkout session API.

Response parameter:
checkout_id
string
Required
A unique identifier for the payment session
status
enum
Required
Refer to checkout_id status as below:

Active: Indicates that the checkout_id has been created
Expired: Indicates that the checkout_id has expired. Merchant can set the validity period while creating the payment session
Cancelled: Indicates that merchant has cancelled the checkout_id
Successful: Indicates that the checkout_id has been paid
Settled: Indicates that the payment amount has been escrowed to merchant.
payment_method
string
Required
Indicates the source of fund used. Refer to the list of enum and their interpretation in create checkout sesssion API request parameters
created_at
string
Required
Create time of the transaction
updated_at
string
Required
Update time of the transaction
checkout_details
object
Required
This object contains all information related to the checkout
Show child child parameters
Sample response
JS EXAMPLE
{
    "checkout_id": "SPP-MTEwOTM1NzczNTk4ODk2MTcz",
    "status": "active",
    "created_at": "2026-04-20T10:39:54+07:00",
    "updated_at": "2026-04-20T10:39:54+07:00",
    "checkout_details": {
        "reference_id": "webhost210",
        "merchant_ext_id": "testxxxpg",
        "store_ext_id": "testxxx",
        "amount": 100000,
        "currency": "IDR",
        "return_url": "https://www.google.com",
        "expiry_time": "2026-04-20T12:39:54+07:00",
        "allowed_payment_method": [
            "spay_later"
        ],
        "customer": {
            "name": "john cena",
            "email": "test@test.com",
            "phone_number": "00810029200006",
            "postal_code": "12345"
        },
        "items": [
            {
                "name": "stuff",
                "quantity": 1,
                "price": 100000000
            },
            {
                "name": "ship",
                "quantity": 1,
                "price": 100000,
                "category": "fee"
            },
            {
                "name": "discount",
                "quantity": 1,
                "price": -100000,
                "category": "discount"
            }
        ]
    }
}

arrow-svg
Copy

Response code
Refer to following table for HTTP error code for get checkout_id status API:

Status code	Error code	Description
200		Success
401	Unauthorized	Unauthorized. Invalid client key
403	feature_not_allowed	The checkout_id does not exist under the merchant account
404	invalid_checkout_id	Unable to find the corresponding checkout_id in gateway system
505	general_error	Any other technical error
Create Refund
Use this endpoint to initiate refund of a successful checkout. There are 2 main types of refund:

Full refund: customer will get back the full payment amount
Partial refund: multiple partial refund is allowed as long as the sum does not exceed the original payment amount. To prevent potential erroneous handling, merchant is advised to wait for previous refund to complete successfully before creating next partial refund.
Request Parameters:
URL: "v1/refund"
amount
int64
Required
The intended payment amount to be refunded to users, inflated by a factor of 100. A positive integer in the smallest currency unit with no decimal point.
original_checkout_id
string
Required
ShopeePay unique checkout_id generated after the checkout creation is successful
refund_reference_id
string
Required
Unique identifier of refund transaction generated by merchant. Accepts up to 64 characters.
Sample request
JS EXAMPLE
{
    "original_checkout_id":"SPP-MTEwOTM1NzczNTk4ODk2MTcz",
    "refund_reference_id": "webhostrefund_211",
    "amount": 90000
}


arrow-svg
Copy

Response Parameters:
refund_id
string
Required
A unique refund identifier generated by ShopeePay that serves as a reference after a refund is created
original_checkout_id
string
Required
ShopeePay unique checkout_id generated after the checkout creation is successful
refund_reference_id
string
Required
Unique identifier of refund transaction generated by merchant. Accepts up to 64 characters.
amount
int64
Required
Amount to be refunded per refund recreation request
created_at
string
Required
Timestamp at which the refund request is created
updated_at
string
Required
Updated time of the transactions
status
string
Required
Status of the refund request. Possible values are pending, succeeded, failed.
Sample response
JS EXAMPLE
{
    "refund_id": "SPP-MTQ5MDQxMTg0MDEzNjQyODIy",
    "original_checkout_id": "SPP-MTEwOTM1NzczNTk4ODk2MTcz",
    "refund_reference_id": "webhostrefund_211",
    "amount": 90000,
    "created_at": "2026-04-20T11:03:49+07:00",
    "updated_at": "2026-04-20T11:04:02+07:00",
    "status": "successful"
}

arrow-svg
Copy

Get Refund Status
Use this endpoint to check status of a refund request.

Request parameters
Path: "v1/refund/{refund_id}
Response parameters
refund_id
string
Required
refund_id returned in create refund API response
amount
int64
Required
Amount of the refund transaction, inflated by a factor of 100. A postive integer in the smallest currency unit , with no decimal point.
status
string
Required
Status of the refund. This can be pending, succeeded, or failed
created_at
string
Required
Timestamp at which the refund request is created
updated_at
string
Required
Timestamp at which the refund request is updated
refund_session_details
object
Required
This objective contains some relevant reference to the refund
Show child child parameters
Sample response
JS EXAMPLE
{
    "refund_id": "SPP-MTQ5MDQxMTg0MDEzNjQyODIy",
    "status": "successful",
    "created_at": "2026-04-20T11:03:49+07:00",
    "updated_at": "2026-04-20T11:04:02+07:00",
    "refund_session_details": {
        "refund_reference_id": "webhostrefund_211",
        "original_checkout_id": "SPP-MTEwOTM1NzczNTk4ODk2MTcz",
        "amount": 90000,
        "currency": "IDR"
    }
}

arrow-svg
Copy

Response code
Refer to the below table to interpret response code in get refund status API:

Status code	Error code	Description
200		Success
401	Unauthorized	Unauthorized due to invalid Client_key
403	feature_not_allowed	The refund_id does not exist under this merchant in ShopeePay system
404	invalid_refund_id	Unable to locate refund_id in gateway system
505	general_error	Any other technical error
Notify transaction status
Upon user completion of payment, ShopeePay will notify merchant of the final checkout status via callback. ShopeePay will also provide callback for expired/cancelled checkout and successful/failed refund. Merchant will need to provide a callback URL that can receive requests from ShopeePay notification server during onboarding.

Each callback request will contain a HMAC signature in the request header that should be verified to ensure authenticity of the callback content. This signature is generated using the ShopeePay issued secret key, assigned to the Merchant receiving the callback request.

Possible event type: checkout.successful, checkout.expired, checkout.cancelled, refund.successful, refund.failed.
Sample checkout callback
JS EXAMPLE
{
  "event_type": "checkout.successful",
  "event_id": "unique_identifier_of_the_webhook_event",
  "timestamp": "2025-05-15T19:00:00+07:00", // when we send the webhook event
  "created_at": "2025-05-15T18:55:00+07:00",
  "updated_at": "2025-05-15T19:00:00+07:00",
  "data": {
    "checkout_id": "unique identifier for the payment session",
    "amount": "10000",
    "currency": "IDR",
    "status": "successful",
    "payment_session_details": {
      "reference_id": "unique-transaction-id-12345",
      "merchant_ext_id": "merchant-system-id-abcde",
      "store_ext_id": "store-id-xyz",
      "currency": "IDR",
      "return_url": "https://www.your-website.com/return",
      "expiry_time": 3600,
      "locale": "en",
      "customer": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone_number": "+6281234567890",
        "address": "Jl. Sudirman No. 1, Jakarta"
      },
      "items": [
        {
          "name": "Product A",
          "description": "Description of Product A",
          "quantity": 1,
          "price": 5000
        },
        {
          "name": "Product B",
          "description": "Description of Product B",
          "quantity": 2,
          "price": 2500
        }
      ],
      "email_address_collection": {
        "enabled": true
      },
      "phone_number_collection": {
        "enabled": false
      }
    }
  }
}

arrow-svg
Copy

Sample refund callback
JS EXAMPLE
{
  "event_type": "refund.successful", //can be refund.failed
  "event_id": "unique_identifier_of_the_webhook_event",
  "timestamp": "2025-05-15T19:00:00+07:00", // when we send the webhook event
  "created_at": "2025-05-15T18:55:00+07:00",
  "updated_at": "2025-05-15T19:00:00+07:00",
  "data": {
    "refund_id":"A unique refund identifier generated by ShopeePay that serves as a reference after the refund is created",
    "amount": "10000",
    "currency": "IDR",
    "status": "successful",
    "failure_reason": "", // this field will be returned to merchant when the refun status is failed or event_type" refund.failed
    "refund_session_details": {
      "refund_reference_id": "unique-transaction-id-12345",
      "original_checkout_id": "unique identifier for the payment session",
      "amount": 10000,
      "currency": "IDR",
      }
    }
  }
}

arrow-svg
Copy

Cancel checkout
Use this endpoint to cancel the checkout using the checkout ID for Create Checkout. Once the checkout_id is cancelled successfully, the corresponding redirect url can no longer be used to make payment.

Request Parameters
URL: POST /v1/checkout/cancel/{checkout_id}
Response Parameters
checkout_id
string
Required
A unique identifier for the payment session
created_at
string
Required
Create time of the transaction
updated_at
string
Required
Update time of the transaction
checkout_details
object
Required
This object contains all information related to the checkout
Show child child parameters
Sample response
JS EXAMPLE
{
    "checkout_id": "SPP-MTMwMTM4OTQxMTM0MDY5Mjg2",
    "created_at": "2026-04-20T13:06:15+07:00",
    "updated_at": "2026-04-20T13:07:41+07:00",
    "checkout_details": {
        "reference_id": "webhost212",
        "merchant_ext_id": "testxxxpg",
        "store_ext_id": "testxxx",
        "amount": 100000,
        "currency": "IDR",
        "return_url": "https://www.google.com",
        "expiry_time": "2026-04-20T15:06:15+07:00",
        "allowed_payment_method": [
            "spay_later"
        ],
        "customer": {
            "name": "john cena",
            "email": "test@test.com",
            "phone_number": "00810029200006",
            "postal_code": "12345"
        },
        "items": [
            {
                "name": "stuff",
                "quantity": 1,
                "price": 100000000
            },
            {
                "name": "ship",
                "quantity": 1,
                "price": 100000,
                "category": "fee"
            },
            {
                "name": "discount",
                "quantity": 1,
                "price": -100000,
                "category": "discount"
            }
        ]
    }
}
