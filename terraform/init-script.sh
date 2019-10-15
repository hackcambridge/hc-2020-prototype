#!/bin/bash
sudo su
/opt/bitnami/ctlscript.sh stop
apt-get -y update
apt-get -y install ruby
apt-get -y install wget
cd /home/bitnami
wget https://aws-codedeploy-eu-west-2.s3.amazonaws.com/latest/install
chmod +x ./install
./install auto
exit
