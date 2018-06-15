CloudSploit Scans using AWS Lambda and AWS Step functions
=========================================================

## Background
CloudSploit scans is an open-source project designed to allow detection of security risks in an AWS account. These scripts are designed to run against an AWS account and return a series of potential misconfigurations and security risks.

Using Step functions and two AWS Lambda functions one can run CloudSploit scans across multiple AWS accounts.

## Setup
* Input all the required AWS accounts to be audit along with their IAM roles which can be used to audit those accounts in `prep.py`. This will be our `Lambda_function_1` to prepare cloudsploit scanner `Lambda_function_2` for cross account AWS audit.
* Create a Step Function in AWS as below:
```
{
  "Comment": "AWS step function for AWS cross account security audit",
  "StartAt": "Lambda_function_1",
  "States": {
    "prepSecurityAudit": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:1234:function:prepSecurityAudit",
      "Next": "Lambda_function_2"
    },
    "runSecurityAudit":{
    "Type": "Task",
    "Resource": "arn:aws:lambda:us-west-2:1234:function:runSecurityAudit",
    "End": true
  }
  }
}
```
* `Lambda_function_1` assumes the role passed by the environment variable `account` in the Lambda configuration.
[Note: Thinking of adding an authenticated slack call to be passed as account name here to the step function which will basically kick off `Lambda_function_1`]
* `Lambda_function_2` the uses credentials of assumed role passed by `Lambda_function_1` and scans the account using these credentials and cloudsploit tool. It then uploads the results to S3 bucket specified in CloudSploit's `index.js`
