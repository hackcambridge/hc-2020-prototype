#!/bin/bash
# Assumes we're using the Bitnami AMI.

SCRIPT_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TIME="$(date +%s)"

# Install Composer (not required in latest version)
# hash php 2>/dev/null || { echo >&2 "PHP needs to be installed.  Aborting."; exit 1; }
# EXPECTED_SIGNATURE="$(wget -q -O - https://composer.github.io/installer.sig)"
# php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
# ACTUAL_SIGNATURE="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"
# if [ "$EXPECTED_SIGNATURE" != "$ACTUAL_SIGNATURE" ]
# then
#     >&2 echo 'ERROR: Invalid installer signature'
#     rm composer-setup.php
#     exit 1
# fi

# php composer-setup.php --quiet
# if [ $? -ne 0 ]; then
#     rm composer-setup.php
#     exit 1;
# fi


# Configure Apache.
SITE_CONF_DIR="/opt/bitnami/apache2/conf/bitnami"
mv $SITE_CONF_DIR/bitnami.conf $SITE_CONF_DIR/bitnami.conf.backup.$TIME
mv $SCRIPT_LOCATION/.hackcambridge/conf/bitnami.conf $SITE_CONF_DIR/bitnami.conf
