#!/bin/bash
# Assumes we're using the Bitnami AMI.

SCRIPT_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CODE_LOCATION="$( cd $SCRIPT_LOCATION/../ >/dev/null 2>&1 && pwd )"
ORIGINAL_LOCATION="$PWD"
cd $SCRIPT_LOCATION;



# Verify PHP and Composer are present.
hash php 2>/dev/null || { echo >&2 "PHP needs to be installed.  Aborting."; exit 1; }
hash composer 2>/dev/null || { echo >&2 "Composer needs to be installed.  Aborting."; exit 1; }



# Composer Install
echo "Installing Composer dependencies..."
composer install
if [ $? -ne 0 ]; then
    >&2 red "Composer dependency installation failed."
    exit 1;
fi
echo "Installed Composer dependencies."
echo "\n--------------------"



# Artisan Key Generation
echo "Running Artisan key generation..."
cp $SCRIPT_LOCATION/.env.base .env
php artisan key:generate
if [ $? -ne 0 ]; then
    >&2 echo "Artisan key generation failed."
    exit 1;
fi
echo "Completed Artisan key generation."
echo "\n--------------------"



# Migrate Database (force to skip confirmation prompt).
php artisan migrate --force
if [ $? -ne 0 ]; then
    >&2 echo "Database migration failed."
    exit 1;
fi
echo "Completed database migration."
echo "\n--------------------"