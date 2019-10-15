#!/bin/bash
sudo su
/opt/bitnami/ctlscript.sh stop
apt-get -y update
apt-get -y install ruby
apt-get -y install wget
cd /home/bitnami

chmod +x ./install
./install auto
exit
