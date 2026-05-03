terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # TODO: Replace with your state bucket
    bucket         = "healthcare-apps-tf-state"
    # TODO: Replace with your state key path
    key            = "eks/terraform.tfstate"
    # TODO: Replace with your AWS region
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "healthcare-apps-tf-locks"
  }
}
