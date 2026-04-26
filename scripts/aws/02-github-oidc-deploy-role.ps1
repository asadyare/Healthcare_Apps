<#
.SYNOPSIS
  Creates GitHub Actions OIDC provider (if missing) and IAM role for aws-actions/configure-aws-credentials.

  Grants: EKS describe (kubeconfig), ECR push/pull for healthcare/* repos, read Secrets Manager app secrets.
  Kubernetes API access is added in 03-eks-grant-github-deploy-access.ps1 after the cluster exists.

.USAGE
  .\02-github-oidc-deploy-role.ps1 -GitHubOrg "asadyare" -GitHubRepo "Healthcare_Apps" -Region eu-west-1

  Set GitHub secret AWS_DEPLOY_ROLE_ARN to the printed RoleArn.
#>
param(
  [string]$GitHubOrg = "asadyare",
  [string]$GitHubRepo = "Healthcare_Apps",
  [string]$Region = "eu-west-1",
  [string]$RoleName = "github-actions-healthcare-deploy"
)

$ErrorActionPreference = "Stop"
$AccountId = (aws sts get-caller-identity --query Account --output text).Trim()
$OidcUrl = "token.actions.githubusercontent.com"
$ProviderArn = "arn:aws:iam::${AccountId}:oidc-provider/${OidcUrl}"

$providers = aws iam list-open-id-connect-providers --output json | ConvertFrom-Json
$exists = $providers.OpenIDConnectProviderList | Where-Object { $_.Arn -eq $ProviderArn }

if (-not $exists) {
  # GitHub-documented thumbprint for token.actions.githubusercontent.com (verify if connection fails).
  aws iam create-open-id-connect-provider `
    --url "https://$OidcUrl" `
    --client-id-list sts.amazonaws.com `
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 | Out-Null
  Write-Host "Created OIDC provider: $ProviderArn"
} else {
  Write-Host "OIDC provider already exists: $ProviderArn"
}

$TrustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "$ProviderArn" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GitHubOrg}/${GitHubRepo}:*"
        }
      }
    }
  ]
}
"@

$TrustFile = [System.IO.Path]::GetTempFileName()
Set-Content -Path $TrustFile -Value $TrustPolicy -Encoding utf8

if (aws iam get-role --role-name $RoleName 2>$null) {
  Write-Host "Updating assume role policy on: $RoleName"
  aws iam update-assume-role-policy --role-name $RoleName --policy-document "file://$TrustFile"
} else {
  aws iam create-role --role-name $RoleName --assume-role-policy-document "file://$TrustFile"
  Write-Host "Created role: $RoleName"
}

Remove-Item $TrustFile -Force

$InlinePolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EksDescribeForKubeconfig",
      "Effect": "Allow",
      "Action": ["eks:DescribeCluster"],
      "Resource": "arn:aws:eks:${Region}:${AccountId}:cluster/*"
    },
    {
      "Sid": "EcrAuthAndPush",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EcrDataPlane",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:${Region}:${AccountId}:repository/healthcare/*"
    },
    {
      "Sid": "SecretsManagerReadAppSecrets",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
      "Resource": "arn:aws:secretsmanager:${Region}:${AccountId}:secret:*healthcare*"
    }
  ]
}
"@

$PolicyFile = [System.IO.Path]::GetTempFileName()
Set-Content -Path $PolicyFile -Value $InlinePolicy -Encoding utf8

aws iam put-role-policy --role-name $RoleName --policy-name HealthcareDeployInline --policy-document "file://$PolicyFile"
Remove-Item $PolicyFile -Force

$RoleArn = (aws iam get-role --role-name $RoleName --query Role.Arn --output text).Trim()
Write-Host ""
Write-Host "=== GitHub repository secret ==="
Write-Host "Name:  AWS_DEPLOY_ROLE_ARN"
Write-Host "Value: $RoleArn"
Write-Host ""
Write-Host "After terraform apply creates the cluster, run:"
Write-Host "  .\03-eks-grant-github-deploy-access.ps1 -ClusterName healthcare-apps-eks -RoleArn `"$RoleArn`""
Write-Host ""
Write-Host "GitHub secret EKS_CLUSTER_NAME must match Terraform variable cluster_name (default: healthcare-apps-eks)."
