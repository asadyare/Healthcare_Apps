<#
.SYNOPSIS
  Grants the GitHub deploy IAM role cluster access via EKS access entries (kubectl apply in Actions).

  Run AFTER: terraform apply has created the cluster and 02-github-oidc-deploy-role.ps1 has run.

.USAGE
  .\03-eks-grant-github-deploy-access.ps1 -ClusterName healthcare-apps-eks -Region eu-west-1 `
    -RoleArn "arn:aws:iam::123456789012:role/github-actions-healthcare-deploy"
#>
param(
  [Parameter(Mandatory = $true)][string]$ClusterName,
  [Parameter(Mandatory = $true)][string]$RoleArn,
  [string]$Region = "eu-west-1"
)

$ErrorActionPreference = "Stop"

$entriesJson = aws eks list-access-entries --cluster-name $ClusterName --region $Region --output json
$entriesObj = $entriesJson | ConvertFrom-Json
$hasEntry = $entriesObj.accessEntries -and ($entriesObj.accessEntries -contains $RoleArn)
if (-not $hasEntry) {
  aws eks create-access-entry `
    --cluster-name $ClusterName `
    --principal-arn $RoleArn `
    --type STANDARD `
    --region $Region
  Write-Host "Created access entry for $RoleArn"
} else {
  Write-Host "Access entry already exists for $RoleArn"
}

$policiesJson = aws eks list-associated-access-policies --cluster-name $ClusterName --principal-arn $RoleArn --region $Region --output json
$policies = $policiesJson | ConvertFrom-Json
$already = $false
if ($policies.associatedAccessPolicies) {
  foreach ($p in $policies.associatedAccessPolicies) {
    if ($p.policyArn -like "*AmazonEKSClusterAdminPolicy*") { $already = $true }
  }
}
if (-not $already) {
  aws eks associate-access-policy `
    --cluster-name $ClusterName `
    --principal-arn $RoleArn `
    --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy `
    --access-scope type=cluster `
    --region $Region
  Write-Host "Associated AmazonEKSClusterAdminPolicy (narrow for production)."
} else {
  Write-Host "Cluster admin policy already associated."
}

Write-Host "Done. The role can use kubectl against cluster $ClusterName."
Write-Host "For least privilege, replace AmazonEKSClusterAdminPolicy with a custom access policy later."
