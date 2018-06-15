#!/bin/bash

### Update prepSecurityAudit Lambda function and Kick off security audit scan using securityAudit step function.

if [ $# -eq 0 ]
  then
    echo "Please input AWS account name."
    exit 0
elif [ $1 == "prod" ] || [ $1 == "sandbox" ] || [ $1 == "config" ] || [ $1 == "corp" ] || [ $1 == "releng" ] || [ $1 == "adt" ] || [ $1 == "web" ] || [ $1 == "avplatform" ] || [ $1 == "analytics" ] || [ $1 == "preprod" ] || [ $1 == "telemetry" ] || [ $1 == "seclabaudit" ] || [ $1 == "partner_api" ] || [ $1 == "maintenance" ]
  then
    ssh  ec2-user@10.x.x.x << EOF
    aws lambda update-function-configuration --function-name "prepSecurityAudit" --environment '{"Variables":{"account":"$1"}}'
    aws stepfunctions start-execution --state-machine-arn "arn:aws:states:us-west-2:1234:stateMachine:securityAudit"
EOF
else
    echo "Invalid AWS account name. Select one of following: prod/preprod/web/maintenance/partner_api/seclabaudit/telemetry/analytics/avplatform/web/adt/releng/corp/config/sandbox"
fi
