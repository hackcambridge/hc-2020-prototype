#!/bin/bash

# Sets up server ready for deployment.
sudo su
/opt/bitnami/ctlscript.sh stop
apt-get -y update
apt-get -y install ruby
apt-get -y install wget
cd /home/bitnami
wget https://aws-codedeploy-eu-west-2.s3.amazonaws.com/latest/install
chmod +x ./install
./install auto

# Set environment variables.
touch /etc/profile.d/hc-deployment-vars.sh
chmod +x /etc/profile.d/hc-deployment-vars.sh
echo "export APP_URL=\"${APP_URL}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export APP_DEBUG=\"${APP_DEBUG}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export APP_ENV=\"${APP_ENV}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export DB_PREFIX=\"${DB_PREFIX}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export DB_HOST=\"${DB_HOST}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export DB_DATABASE=\"${DB_DATABASE}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export DB_USERNAME=\"${DB_USERNAME}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export DB_PASSWORD=\"${DB_PASSWORD}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export AWS_ACCESS_KEY_ID=\"${AWS_ACCESS_KEY_ID}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export AWS_SECRET_ACCESS_KEY=\"${AWS_SECRET_ACCESS_KEY}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export AWS_BUCKET=\"${AWS_BUCKET}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export AUTH0_DOMAIN=\"${AUTH0_DOMAIN}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export AUTH0_CLIENT_ID=\"${AUTH0_CLIENT_ID}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export AUTH0_CLIENT_SECRET=\"${AUTH0_CLIENT_SECRET}\"" >> /etc/profile.d/hc-deployment-vars.sh
echo "export MAILGUN_SECRET=\"${MAILGUN_SECRET}\"" >> /etc/profile.d/hc-deployment-vars.sh

# Set htpasswd file.
# touch /etc/profile.d/.htpasswd
# echo 'canary:$apr1$.6lFfhed$opJtcT7xrgfDqT7BBPbu5/' >> /etc/profile.d/.htpasswd

exit

# Assumes we're using the Bitnami AMI.
export PATH="/opt/bitnami/php/bin/:$PATH"

# Install Composer (not required in latest version)
hash php 2>/dev/null || { echo >&2 "PHP needs to be installed.  Aborting."; exit 1; }
EXPECTED_SIGNATURE="$(wget -q -O - https://composer.github.io/installer.sig)"
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
ACTUAL_SIGNATURE="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"
if [ "$EXPECTED_SIGNATURE" != "$ACTUAL_SIGNATURE" ]
then
    >&2 echo 'ERROR: Invalid installer signature'
    rm composer-setup.php
    exit 1
fi

php composer-setup.php --quiet
if [ $? -ne 0 ]; then
    rm composer-setup.php
    exit 1;
fi

sudo mv /opt/bitnami/php/bin/composer.phar /opt/bitnami/php/bin/composer.phar.old
sudo mv composer.phar /opt/bitnami/php/bin/
rm composer-setup.php
