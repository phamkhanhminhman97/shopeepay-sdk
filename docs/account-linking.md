Account Linking
ShopeePay offers the following functionalities for account linking and payment use cases:

Initiate an Account Linking & Get Access Token
Request for Account Unlinking
Notify Account Linking/Unlinking Status
Use Cases for Account Linking
Create Payment Order: Link & Pay
Create Payment Order: Subscription
Get User Information
Get Coin Redemption
Merchant Workflow
To accept the payment in this scenario, the merchant needs to complete the following steps

Initiate a account linking request when customer chooses to link their ShopeePay account.

Handle the redirect URL returned.

Get access token by using returned auth code, and save token for future use cases (e.g. to obtain user information).

Initiate a payment request (via Link & Pay or Subscription ) when customer selects to pay or when payment is due.


After customer chooses to link their ShopeePay account on merchant's application or website, the merchant calls the Initiate an Account Link endpoint to start the linking process.
ShopeePay returns a redirect_url and this URL can be used by merchant to direct user to ShopeePay's linking agreement page.
The customer agrees to link their account to the merchant.
Upon successful linking, the customer returns back to the merchant’s page as indicated in the redirect_url in the Account Link request, along with an auth code. ShopeePay also sends an asynchronous message via Notify Account Link Status endpoint to inform merchants of the successful linking.
Merchant may either rely on the notification callback from ShopeePay, or the auth code passed by its frontend, to call the Get Access Token endpoint.
Once the merchant obtains the access token, they should save it securely for future use.
Should the customer chooses to unlink ShopeePay in the future, the merchant should call the Account Unlink endpoint to invalidate the access token. Once the unlink request is successful, the merchant will not be able to query or charge the customer’s ShopeePay account. ShopeePay also sends an asynchronous message via Notify Account Link Status endpoint to inform merchants of the successful unblinking.
API Documentation
Initiate an Account Linking
Get Access Token
Request for Account Unlinking
Notify Account Linking / Unlinking Status
Use Case for Get Access Token
Get User Information
Get Coin Redemption
Initiate an Account Linking
Use this endpoint to kick start the account linking process of a ShopeePay account to your platform.

URL: "/v3/merchant-host/account/link"
Request Parameters
request_id
string
Required
Unique identifier for each account linking request, accepts up to 64 characters.
return_url
string
Required
URL to redirect to after customer completes verification on ShopeePay.
linking_reference_id
string
Unique identifier in merchant’s system to identify this linking.

Accepts up to 64 characters
merchant_ext_id
string
Required
Unique identifier of merchant in merchant’s system.
service_name
string
Name in merchant’s system to identify this linking service.
service_id
string
dentifier in merchant’s system to identify this service associated with this specific linking.
linking_description
string
General description about this linking.
phone
string
Required
Registered phone number of the customer on merchant’s platform, to be provided with the country code and without the plus sign.
platform_type
string
Type of the merchant’s platform where the customer triggered the account linking flow from.
additional_info
object
Merchants can use it to include any customized data such as metadata or risk-related information needed for enhanced processing and verification.

Please contact our team for more details
Show child child parameters





Sample API Request
{
            "request_id": "input-unique-request-id-here",
            "return_url":"https://isv-domain.com",
            "linking_reference_id": "ref-id-tracking",
            "merchant_ext_id": "external-merchant",
            "service_name": "merchant-name",
            "service_id": "input-service-id-here",
            "linking_description": "input-linking-description-here",
            "phone": "6282112345678",
            "platform_type": "app"
}

arrow-svg
Copy

Response Parameters
request_id
string
The same value as the 'request_id' in the request.
errcode
string
Error code to specify the error returned.
debug_msg
string
Debug message to provide more information.
redirect_url_web
string
Indicates the URL to ShopeePay’s linking agreement page. Merchant should not impose any domain whitelisting and IP restriction for this URL.
Sample API Response
{
            "request_id": "input-unique-request-id-here",
            "errcode": 0,
            "debug_msg": "success",
            "redirect_url_web": "https://app.uat.shopeepay.vn/universal-link/payment/account-linking/pre-link?ticket=131503566697895231",
}

arrow-svg
Copy

Response Code
Please refer to the following description for a general explanation of the errcode returned during an API Response.

For a more detailed explanation, it is advisable to consult debug_msg field. This field provides additional information that can offer valuable insights for troubleshooting.

Merchants may choose to display the debug_msg to their operators or staffs to facilitate prompt identification and resolution of the issue.

Value	Description
-2	A server dropped the connection
-1	A server error occurred, merchant may initiate a new account linking request or request using same 'linking_reference_id'
0	Success
1	The request parameters is invalid or a mandatory parameter is empty
2	Permission denied, often due to invalid status
11	Duplicated request
305	Invalid merchant
300026	Invalid or expired QR
Get Access Token
Use this API to get a ShopeePay access token using the linking_reference_id.

URL: "/v3/merchant-host/access-token/get"
Request Parameters
request_id
string
Required
Unique identifier for each account linking request, accepts up to 64 characters.
linking_reference_id
string
Required
Unique identifier in merchant’s system to identify this linking, same as what is used in the Create Account Linking endpoint.
Sample API Request
{
            "request_id": "input-unique-request-id-here",
            "linking_reference_id": "ref-id-tracking"
}

arrow-svg
Copy

Response Parameters
request_id
string
The same value as the request_id in the request.
errcode
int32
Error code to specify the error returned.
debug_msg
string
Debug message to provide more information.
access_token
string
The access token used to identify the ShopeePay account to be linked. Merchants must store this securely in their systems and pass this in the subsequent payment requests.
user_id_hash
string
Unique identifier for a ShopeePay user.
linking_reference_id
string
Unique identifier in merchant’s system to identify this linking.
merchant_ext_id
string
Unique identifier of merchant in merchant's system.
linking_status
int32
Status of the linking. If the Get Access Token API call is successful, this field should always be 1 (Active).
create_time
string
Create time for this individual linking.
update_time
string
Update time for this individual linking.
Sample API Response
{
            "request_id": "input-unique-request-id-here",
            "errcode": 0,
            "debug_msg": "success",
            "access_token": "2r4a56n7o3e56s473t8c2y78e",
            "user_id_hash": "697863f9295aeddcb3db598ecbc74c59a13335abf4d8c41b40e33b28a9d7d63c",
            "merchant_ext_id": "external-merchant",
            "linking_reference_id": "ref-id-tracking",
            "linking_status": 1,
            "create_time": 1708937423,
            "update_time": 1708937423
}

arrow-svg
Copy

Response Code
Please refer to the following description for a general explanation of the errcode returned during an API Response.

For a more detailed explanation, it is advisable to consult debug_msg field. This field provides additional information that can offer valuable insights for troubleshooting.

Merchants may choose to display the debug_msg to their operators or staffs to facilitate prompt identification and resolution of the issue.

Value	Description
-2	A server dropped the connection
-1	A server error occurred
0	Success
1	The request parameters is invalid or a mandatory parameter is empty
2	Permission denied, often due to invalid status
9	Customer’s account is banned
14	Customer’s account is deleted
24	Customer’s account is frozen
27	Customer’s account is not activated
105	Invalid auth code
150	Active linking count threshold reached
305	Invalid merchant
907	Unable to verify customer
300059	Bank account not linked
Request for Account Unlinking
Use this endpoint to unlink a ShopeePay account from a customer’s account on your platform.

URL: "/v3/merchant-host/account/unlink"
Request Parameters
request_id
string
Unique identifier for each account linking request, accepts up to 64 characters.
linking_reference_id
string
Unique identifier in merchant’s system to identify this linking, same as what is used in the Account Linking endpoint.
Sample API Request
{
            "request_id": "input-unique-request-id-here",
            "linking_reference_id": "ref-id-tracking"
}

arrow-svg
Copy

Response Parameters
request_id
string
The same value as the request_id in the request.
errcode
int32
Error code to specify the error returned.
debug_msg
string
Debug message to provide more information.
merchant_ext_id
string
Unique identifier of merchant in merchant's system.
linking_status
int32
Status of the linking. If the Account Unlink API call is successful, this field should always be 3 (Invalid).
create_time
string
Create time for this individual unlinking.
update_time
string
Update time for this individual unlinking.
access_token
string
The access token used to identify a ShopeePay customer’s account.
user_id_hash
string
Identifier for the customer that made the payment.
linking_reference_id
string
Unique identifier in merchant’s system to identify this linking.
Sample API Response
{
            "request_id": "input-unique-request-id-here",
            "errcode": 0,
            "debug_msg": "success",
            "access_token": "2r4a56n7o3e56s473t8c2y78e",
            "user_id_hash": "697863f9295aeddcb3db598ecbc74c59a13335abf4d8c41b40e33b28a9d7d63c",
            "merchant_ext_id": "external-merchant",
            "linking_reference_id": "ref-id-tracking",
            "linking_status":3,
            "create_time": 1708937423,
            "update_time": 1708937423
}

arrow-svg
Copy

Response Code
Please refer to the following description for a general explanation of the errcode returned during an API Response.

For a more detailed explanation, it is advisable to consult debug_msg field. This field provides additional information that can offer valuable insights for troubleshooting.

Merchants may choose to display the debug_msg to their operators or staffs to facilitate prompt identification and resolution of the issue.

Value	Description
-2	A server dropped the connection
-1	A server error occurred, merchant may initiate a new account unlinking request or request using same 'linking_reference_id'
0	Success
1	The request parameters is invalid or a mandatory parameter is empty
152	Fail to unlink due to ongoing auth
305	Invalid merchant
2000	A server error occurred
Notify Account Link Status
This request will send details of the specific linking lifecycle to the merchant server’s callback URL, which is configured in ShopeePay’s system at the time of onboarding.

Each callback request will contain a signature in the request header. This signature is generated using the ShopeePay-issued secret key, assigned to the merchant receiving the callback request. Merchant should use this signature to verify the authenticity of the callback content.

Multiple repeated notifications might be sent to the merchant and merchant shall be able to handle the repeated notifications with the same contents properly.

Merchants should not impose any check or limit on the sequence nor the length of each field of the callback request.

Note: It is recommended for the merchant using this Callback to validate that the linking_reference_id matches the original account or link request’s linking_reference_id before considering the customer’s action to be completed.

request_id
string
The same value as the request_id in the request.
linking_reference_id
string
Unique identifier in merchant’s system to identify this linking. If not provided during Account Link, it will be auto-generated by the ShopeePay system.
merchant_ext_id
string
Unique identifier of merchant in client system.
update_type
int64
Status update of the customer's linking status:

1 = User successfully authorized the linking (and merchant should now call Get Access Token)
2 = User account is linked successfully
3 = User token status is invalidated by ShopeePay
4 = User has successfully unlinked with the merchant
5 = Merchant has successfully unlinked with the user
Sample Callback for Successful User Authorization on ShopeePay
When merchant gets this callback with update_type = 1, merchant should call the Get Access Token.

{
            "request_id": "input-unique-request-id-here",
            "linking_reference_id": "ref-id-tracking",
            "merchant_ext_id": "external-merchant",
            "update_type": 1
}

arrow-svg
Copy

Sample Callback for Unlinking
JS EXAMPLE
{
            "request_id": "input-unique-request-id-here",
            "linking_reference_id": "ref-id-tracking",
            "merchant_ext_id": "external-merchant",
            "update_type": 4
}

arrow-svg
Copy

Use Cases for Get Access Token

Get User Information
Get Coin Redemption
Get User Info
Use this endpoint to get customer’s ShopeePay account information for display purposes.

URL: "/v3/merchant-host/user-info/get"
Request Parameters
request_id
string
Required
Unique identifier for each account linking request, accepts up to 64 characters.
access_token
string
Required
The access token used to identify the user account.
Sample API Request
{
            "request_id": "input-unique-request-id-here",
            "access_token": "54673258746782637482",
}

arrow-svg
Copy

Response Parameters
request_id
string
The same value as the request_id in the request.
errcode
int32
Error code to specify the error returned.
debug_msg
string
Debug message to provide more information.
linking_info
object
Linking information. Returned only when linking is found for linking_reference_id or access_token.
Show child child parameters


user_info
object
Will return empty if the ShopeePay account is deleted, banned or frozen.
Show child child parameters
Sample API Response
{
            "request_id": "input-unique-request-id-here",
            "errcode": 0,
            "debug_msg": "success",
            "user_info": {
                    "wallet_balance": 0,
                    "spaylater_info": {
                        "available_balance": 45000000,
                        "status_info": "active"
                    },
                    "kyc_passed": true
            },
            "linking_info": {
                    "linking_status": 1,
                    "create_time": 1708937423,
                    "update_time": 1708937423,
                    "user_id_hash": "697863f9295aeddcb3db598ecbc74c59a13335abf4d8c41b40e33b28a9d7d63c",
                    "linking_reference_id": "ref-id-tracking",
                    "merchant_ext_id": "external-merchant"
            }
}

arrow-svg
Copy

Response Code
Value	Description
-2	A server dropped the connection
-1	A server error occurred
0	Success
1	The request parameters is invalid or a mandatory parameter is empty
2	Permission denied, often due to invalid status
24	Customer's account is frozen
27	Customer's account is not activated
305	Invalid merchant
Get Coin Redemption Info
Use this endpoint to get the customer's maximum redeemable coin amount in percentage or in absolute amount.

URL: "/v3/merchant-host/coin/potential-redemption"
Note: This API is temporarily unavailable for use in Thailand and Vietnam.

Request Parameters
request_id
string
Unique identifier for each account linking request, accepts up to 64 characters.
access_token
string
The access token used to identify the customer's account.
payment_amount
int64
Payment amount value inflated by 100. Pass this field if the merchant wants to display the exact amount of redeemable coins for a specific payment.
Sample API Request
{
            "request_id": "input-unique-request-id-here",
            "access_token": "54673258746782637482",
            "payment_amount": 10000
}

arrow-svg
Copy

Response Parameters
request_id
string
The same value as the request_id in the request.
errcode
int32
Error code to specify the error returned.
debug_msg
string
Debug message to provide more information.
max_coin_percentage
int64
Maximum percentage of the payment that can be redeemed by coins.
potential_payment_amount
int64
Estimated payment amount after coin redemption, value inflated by 100.
potential_coin_amount
int64
Maximum amount of coins that can be used in the payment, value inflated by 100.
Sample API Response
{
            "request_id": "input-unique-request-id-here",
            "errcode": 0,
            "debug_msg": "success",
            "max_coin_percentage": 10,
            "potential_payment_amount": 10000,
            "potential_coin_amount": 30
}

arrow-svg
Copy

Response Code
Value	Description
-2	A server dropped the connection
-1	A server error occurred
0	Success
1	The request parameters is invalid or a mandatory parameter is empty
2	Permission denied, often due to invalid status
27	Customer's account is not activated
305	Invalid merchant
702	Coin redemption disabled
705	Coin redemption disabled