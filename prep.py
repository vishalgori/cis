import boto3, json, os

def lambda_handler(event, context):
    # Future scope to load these configurations using YAML from another S3 bucket
    account = str(os.environ['account']).lower()
    bucket_name = str(os.environ['bucket_name']).lower()
    bucket_file_name = str(os.environ['bucket_file_name']).lower()
    details = assume_role(account) #STS to assume account role for which we need to describe_instances()
    # result = put_to_s3(bucket_name, bucket_file_name, temp_creds)
    #return result
    #return "Temporary credentials for security_audit role in " + account + " have now been pushed to: " + bucket_name
    return details

def assume_role(account):
    # Future scope to load these configurations using YAML from another S3 bucket
    print ("Will now try to assume role: "+account)
    if account == "xx": role_arn = "arn:aws:iam::12346:role/infosec-smartthings_security_audit"
    elif account == "yy": role_arn = "arn:aws:iam::12345:role/infosec-smartthings_security_audit"
    elif account == "zz": role_arn = "arn:aws:iam::12348:role/infosec-smartthings_security_audit"
    elif account == "qwert": role_arn = "arn:aws:iam::12347:role/infosec-smartthings_security_audit"
    elif account == "seclab": role_arn = "arn:aws:iam::12349:role/cloudsploit_lambda"
    else: print ("Please select account names as one of the following: adt/analytics/avplatform/config/corp/maintenance/partner_api/preprod/production/releng/sandbox/telemetry/web/seclab") #Return this as message to slack

    # create an STS client object that represents a live connection to the
    # STS service
    sts_client = boto3.client('sts')

    # Call the assume_role method of the STSConnection object and pass the role
    # ARN, role session name and session expiration duration in seconds (set to 15 minutes here which is the minimum possible).
    assumedRoleObject = sts_client.assume_role(
        RoleArn=role_arn,
        RoleSessionName="AssumedRole"+account,
        DurationSeconds=900
    )

    # From the response that contains the assumed role, get the temporary
    # credentials that can be used to make subsequent API calls
    #credentials = assumedRoleObject['Credentials']
    details = {
        "account" : account,
        "session" : {"role": assumedRoleObject['AssumedRoleUser']['AssumedRoleId']},
        "creds" : {"accessKeyId" : assumedRoleObject['Credentials']['AccessKeyId'],
        "secretAccessKey" : assumedRoleObject['Credentials']['SecretAccessKey'],
        "sessionToken" : assumedRoleObject['Credentials']['SessionToken'],
        "region" : "us-west-2"}
    }
    return details

'''def put_to_s3(bucket_name, bucket_file_name, temp_creds):
    # Push temporary credentials to S3 bucket
    s3 = boto3.resource('s3')
    result = s3.Object(bucket_name, bucket_file_name).put(Body=str(temp_creds), ServerSideEncryption='AES256')
    # s3.Object("st-security-audit", "temp-credstore/credentials.json").put(Body=str(d), ServerSideEncryption='AES256') - Auto replaces existing file.
    return result'''
