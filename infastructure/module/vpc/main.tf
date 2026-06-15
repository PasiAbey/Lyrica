resource "aws_vpc" "vpc-main" {
    cidr_block = var.vpc_cidr_block

    tags = {
        Name = var.vpc_name
    }
}

resource "aws_internet_gateway" "igw" {
    vpc_id = aws_vpc.vpc-main.id

    tags = {
        Name = "${var.vpc_name}-igw"
    }
}


resource "aws_subnet" "subnet-public" {
    vpc_id     = aws_vpc.vpc-main.id
    cidr_block = var.subnet_cidr_block
    map_public_ip_on_launch = true

    tags = {
        Name = "${var.vpc_name}-public-subnet"
    }
}


resource "aws_route_table" "route-table-public" {
    vpc_id = aws_vpc.vpc-main.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igw.id
    }

    tags = {
        Name = "${var.vpc_name}-public-route-table"
    }
}


resource "aws_route_table_association" "route-table-association-public" {
    subnet_id      = aws_subnet.subnet-public.id
    route_table_id = aws_route_table.route-table-public.id
}