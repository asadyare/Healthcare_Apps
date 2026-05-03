<#
.SYNOPSIS
  Writes a Terraform state-only IAM policy JSON (replace placeholders) for the principal that runs terraform init/plan/apply.

.USAGE
  .\04-render-terraform-state-policy.ps1 -Region eu-west-1 -BucketName healthcare-apps-tf-state -LockTable healthcare-apps-tf-locks `
    -OutFile .\terraform-state-policy.rendered.json
#>
param(
  [string]$Region = "us-east-1",
  [string]$BucketName = "healthcare-apps-tf-state",
  [string]$LockTable = "healthcare-apps-tf-locks",
  [string]$OutFile = "$PSScriptRoot\terraform-state-policy.rendered.json"
)

$ErrorActionPreference = "Stop"
$AccountId = (aws sts get-caller-identity --query Account --output text).Trim()
$template = Get-Content "$PSScriptRoot\terraform-state-iam-policy.json" -Raw
$rendered = $template `
  -replace "REPLACE_BUCKET", $BucketName `
  -replace "REPLACE_REGION", $Region `
  -replace "REPLACE_ACCOUNT", $AccountId `
  -replace "REPLACE_LOCK_TABLE", $LockTable

Set-Content -Path $OutFile -Value $rendered -Encoding utf8
Write-Host "Wrote: $OutFile"
Write-Host "Create managed policy (one-time):"
Write-Host "  aws iam create-policy --policy-name healthcare-terraform-state --policy-document file://$($OutFile.Replace('\','/'))"
Write-Host "Attach to your IAM user or CI role that runs terraform (state only). Full apply still needs EKS/VPC/IAM permissions."
