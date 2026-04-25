provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "healthcare-apps"
      Environment = var.environment
      ManagedBy   = "terraform"
      DataClass   = "phi"
    }
  }
}
