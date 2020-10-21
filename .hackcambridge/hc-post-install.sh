#!/bin/bash
# Assumes we're using the Bitnami AMI.

# Environment variables
export PATH="/opt/bitnami/php/bin/:$PATH"

# SCRIPT_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
SCRIPT_LOCATION="/home/bitnami/htdocs/.hackcambridge"
CODE_LOCATION="$( cd $SCRIPT_LOCATION/../ >/dev/null 2>&1 && pwd )"
ORIGINAL_LOCATION="$PWD"



# Permissions
echo "Code Location: $CODE_LOCATION"
cd $CODE_LOCATION
sudo chown -R bitnami:daemon .
sudo chmod -R 0774 $CODE_LOCATION/storage
sudo chmod -R 0774 $CODE_LOCATION/bootstrap/cache



# Verify PHP and Composer are present.
hash php 2>/dev/null || { echo >&2 "PHP needs to be installed.  Aborting."; exit 1; }
hash composer 2>/dev/null || { echo >&2 "Composer needs to be installed.  Aborting."; exit 1; }



# Composer Install
echo "Installing Composer dependencies..."
cd $CODE_LOCATION;
composer install
if [ $? -ne 0 ]; then
    >&2 echo "Composer dependency installation failed."
    exit 1;
fi
echo "Installed Composer dependencies."
echo "--------------------"



# Artisan Environment Setup
echo "Running Artisan key generation..."
cp $SCRIPT_LOCATION/.env.deploy .env
php artisan key:generate
if [ $? -ne 0 ]; then
    >&2 echo "Artisan key generation failed."
    exit 1;
fi
echo "Completed Artisan key generation."
echo "--------------------"



# Copy secrets into .env
source /etc/profile.d/hc-deployment-vars.sh
echo "APP_DEBUG=\"$APP_DEBUG\"" >> .env
echo "APP_ENV=\"$APP_ENV\"" >> .env
echo "APP_URL=\"$APP_URL\"" >> .env
echo "DB_PREFIX=\"$DB_PREFIX\"" >> .env
echo "DB_HOST=\"$DB_HOST\"" >> .env
echo "DB_DATABASE=\"$DB_DATABASE\"" >> .env
echo "DB_USERNAME=\"$DB_USERNAME\"" >> .env
echo "DB_PASSWORD=\"$DB_PASSWORD\"" >> .env
echo "AWS_ACCESS_KEY_ID=\"$AWS_ACCESS_KEY_ID\"" >> .env
echo "AWS_SECRET_ACCESS_KEY=\"$AWS_SECRET_ACCESS_KEY\"" >> .env
echo "AWS_BUCKET=\"$AWS_BUCKET\"" >> .env
echo "AUTH0_DOMAIN=\"$AUTH0_DOMAIN\"" >> .env
echo "AUTH0_CLIENT_ID=\"$AUTH0_CLIENT_ID\"" >> .env
echo "AUTH0_CLIENT_SECRET=\"$AUTH0_CLIENT_SECRET\"" >> .env
echo "MAILGUN_SECRET=\"$MAILGUN_SECRET\"" >> .env


# Set htpasswd.
# echo "AuthUserFile /etc/profile.d/.htpasswd" >> public/.htaccess
# echo "AuthType Basic" >> public/.htaccess
# echo "require valid-user" >> public/.htaccess


# Migrate Database (force to skip confirmation prompt).
php artisan migrate --force
if [ $? -ne 0 ]; then
    >&2 echo "Database migration failed."
    exit 1;
fi
echo "Completed database migration."
echo "--------------------"



# Restart Apache.
sudo /opt/bitnami/ctlscript.sh restart apache
sudo /opt/bitnami/ctlscript.sh restart php-fpm
