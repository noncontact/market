provider "aws" {
	region = "ap-southeast-1"
	default_tags {
	tags = {
		Name = "student961018"
		Subject = "cloud-programming"
		Chapter = "practice3"
		}
	}
}

variable "vpc_main_cidr" {
 description = "VPC Main CIDR block"
 default = "10.12.0.0/23"
}

resource "aws_vpc" "my_vpc_961018" {
 cidr_block = var.vpc_main_cidr
 instance_tenancy = "default"
 enable_dns_hostnames = true
}

resource "aws_vpc_ipv4_cidr_block_association" "secondary_cidr_961018" {
 vpc_id = aws_vpc.my_vpc_961018.id
 cidr_block = "10.23.0.0/23"
}

resource "aws_subnet" "pub_sub_961018_1" {
 vpc_id = aws_vpc.my_vpc_961018.id
 cidr_block = cidrsubnet(aws_vpc.my_vpc_961018.cidr_block,2,0)
 availability_zone = "ap-southeast-1a"
 map_public_ip_on_launch = true
}

resource "aws_subnet" "prv_sub_961018_1"{
 vpc_id = aws_vpc.my_vpc_961018.id
 cidr_block = cidrsubnet(aws_vpc.my_vpc_961018.cidr_block,2,1)
 availability_zone = "ap-southeast-1a"
}
resource "aws_subnet" "prv_sub_961018_1_db"{
 vpc_id = aws_vpc.my_vpc_961018.id
 cidr_block = cidrsubnet(aws_vpc.my_vpc_961018.cidr_block,2,2)
 availability_zone = "ap-southeast-1a"
}

resource "aws_subnet" "pub_sub_961018_2"{
 vpc_id = aws_vpc.my_vpc_961018.id
 cidr_block = cidrsubnet(aws_vpc_ipv4_cidr_block_association.secondary_cidr_961018.cidr_block,2,0)
 availability_zone = "ap-southeast-1b"
 map_public_ip_on_launch = true
}
resource "aws_subnet" "prv_sub_961018_2"{
 vpc_id = aws_vpc.my_vpc_961018.id
 cidr_block = cidrsubnet(aws_vpc_ipv4_cidr_block_association.secondary_cidr_961018.cidr_block,2,1)
 availability_zone = "ap-southeast-1b"
}
resource "aws_subnet" "prv_sub_961018_2_db"{
 vpc_id = aws_vpc.my_vpc_961018.id
 cidr_block = cidrsubnet(aws_vpc_ipv4_cidr_block_association.secondary_cidr_961018.cidr_block,2,2)
 availability_zone = "ap-southeast-1b"
}

resource "aws_internet_gateway" "my_igw_961018" {
 vpc_id = aws_vpc.my_vpc_961018.id
}

resource "aws_route_table" "pub_rt_961018" {
 vpc_id = aws_vpc.my_vpc_961018.id
 route {
  cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.my_igw_961018.id
 }
}

resource "aws_route_table" "prv_rt1" {
 vpc_id = aws_vpc.my_vpc_961018.id
 route {
  cidr_block = "0.0.0.0/0"
  nat_gateway_id = aws_nat_gateway.nat_gw_1.id
 }
}
resource "aws_route_table" "prv_rt1_db" {
 vpc_id = aws_vpc.my_vpc_961018.id
}
resource "aws_route_table"  "prv_rt2"{
 vpc_id = aws_vpc.my_vpc_961018.id
 route {
  cidr_block = "0.0.0.0/0"
  nat_gateway_id = aws_nat_gateway.nat_gw_2.id
 }
}
resource "aws_route_table" "prv_rt2_db" {
 vpc_id = aws_vpc.my_vpc_961018.id
}

resource "aws_route_table_association" "pub_rt_asso"{
 subnet_id = aws_subnet.pub_sub_961018_1.id
 route_table_id = aws_route_table.pub_rt_961018.id
}

resource "aws_route_table_association" "pub_rt_asso2"{
 subnet_id = aws_subnet.pub_sub_961018_2.id
 route_table_id = aws_route_table.pub_rt_961018.id
}

resource "aws_route_table_association" "prv_rt1_asso"{
 subnet_id = aws_subnet.prv_sub_961018_1.id
 route_table_id = aws_route_table.prv_rt1.id
}
resource "aws_route_table_association" "prv_rt1_db_asso"{
 subnet_id = aws_subnet.prv_sub_961018_1_db.id
 route_table_id = aws_route_table.prv_rt1_db.id
}
resource "aws_route_table_association" "prv_rt2_asso"{
 subnet_id = aws_subnet.prv_sub_961018_2.id
 route_table_id = aws_route_table.prv_rt2.id
}
resource "aws_route_table_association" "prv_rt2_db_asso"{
 subnet_id = aws_subnet.prv_sub_961018_2_db.id
 route_table_id = aws_route_table.prv_rt2_db.id
}

resource "aws_eip" "nat_eip1" {
domain = "vpc"
}
resource "aws_eip" "nat_eip2" {
domain = "vpc"
}

resource "aws_nat_gateway" "nat_gw_1" {
allocation_id = aws_eip.nat_eip1.id
subnet_id = aws_subnet.pub_sub_961018_1.id
depends_on = [aws_internet_gateway.my_igw_961018]
}
resource "aws_nat_gateway" "nat_gw_2" {
allocation_id = aws_eip.nat_eip2.id
subnet_id = aws_subnet.pub_sub_961018_2.id
depends_on = [aws_internet_gateway.my_igw_961018]
}



