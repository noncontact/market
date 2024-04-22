variable "server_port" {
  description = "Webserver's HTTP port"
  type = number
  default = 5000
}

variable "my_ip" {
  description = "My public IP"
  type = string
  default = "58.141.234.48/32"
}

variable "alb_security_group_name" {
  description = "The name of the NLB's security group"
  type = string
  default = "webserver-nlb-sg-student961018"
}
variable "alb_name" {
  description = "The name of the NLB"
  type = string
  default = "webserver-nlb-student961018"
}
