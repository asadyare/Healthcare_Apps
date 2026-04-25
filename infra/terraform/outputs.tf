output "eks_cluster_name" {
  value = aws_eks_cluster.this.name
}

output "ecr_repositories" {
  value = { for k, v in aws_ecr_repository.services : k => v.repository_url }
}
