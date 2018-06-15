#!/bin/bash

### This script is used to update runSecurityAudit Lambda function after changes to CloudSploit scanner source code.

### This script requires local ~/.ssh/config file to have below two lines for SSH forwarding to work over bastion host:
#Host 10.x.x.x ### Security lab development ec2 instance private IP.
#ProxyCommand ssh -o 'ForwardAgent yes' ubuntu@ec2-34-x-x-x.us-west-2.compute.amazonaws.com 'ssh-add && nc %h %p' ### Security Lab's bastion host --> 34.x.x.x

rm ../lambda.zip
zip -r ../lambda.zip *
scp /Users/vgori/Documents/CloudSecurity/SecurityAudit/LAMBDAusingStepFunctions/lambda.zip ec2-user@x.x.x.x:/home/ec2-user/
ssh  ec2-user@10.x.x.x << EOF
aws lambda update-function-code --function-name "runSecurityAudit" --zip-file fileb:///home/ec2-user/lambda.zip
EOF
