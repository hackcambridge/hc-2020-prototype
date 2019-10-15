#!/bin/bash
# Assumes we're using the Bitnami AMI.

SCRIPT_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TIME="$(date +%s)"

# Configure Apache.
SITE_CONF_DIR="/opt/bitnami/apache2/conf/bitnami"
rm $SITE_CONF_DIR/bitnami.conf
cp $SCRIPT_LOCATION/conf/bitnami.conf $SITE_CONF_DIR/bitnami.conf
