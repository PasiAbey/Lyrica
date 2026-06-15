#!bin/bash

et -eux

apt-get update -y

#install docker
apt-get install -y docker.io

systemctl daemon-reload
systemctl enable docker
systemctl start docker

apt-get install -y snapd

#install amazon ssm agent
sudo snap install amazon-ssm-agent --classic

systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service