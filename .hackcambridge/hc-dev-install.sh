#!/bin/sh
SCRIPT_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CODE_LOCATION="$( cd $SCRIPT_LOCATION/../ >/dev/null 2>&1 && pwd )"
ORIGINAL_LOCATION="$PWD"
HOMESTEAD_BOX_VERSION="9.1.0"
HOMESTEAD_GIT_RELEASE="v10.0.1"

# Printing.
PREFIX="[hc-dev]"
CYAN='\033[0;36;1m'
GREEN='\033[0;32;1m'
RED='\033[0;31;1m'
NC='\033[0m'
blue () { echo "${CYAN}${PREFIX} $1 ${NC}"; }
green () { echo "${GREEN}${PREFIX} $1 ${NC}"; }
red () { echo "${RED}${PREFIX} $1 ${NC}"; }

# Set the correct location to execute the script from.
cd $SCRIPT_LOCATION;


# Verify all dependencies are installed.
hash vagrant 2>/dev/null || { echo >&2 "Vagrant needs to be installed.  Aborting."; exit 1; }
hash composer 2>/dev/null || { echo >&2 "Composer needs to be installed.  Aborting."; exit 1; }
hash php 2>/dev/null || { echo >&2 "PHP needs to be installed.  Aborting."; exit 1; }
hash vboxmanage 2>/dev/null || { echo >&2 "VirtualBox needs to be installed.  Aborting."; exit 1; }
hash git 2>/dev/null || { echo >&2 "Git needs to be installed.  Aborting."; exit 1; }
echo ""
green "All prerequisites met, starting installation.\n"


# For moral support...
# python -mwebbrowser https://media.giphy.com/media/OCu7zWojqFA1W/source.gif > /dev/null 2>&1


# Add the Homestead Vagrant box.
blue "Installing laravel/homestead..."
vagrant box list | grep -q "laravel/homestead (virtualbox, ${HOMESTEAD_BOX_VERSION})"
if [ $? -ne 0 ]; then
    vagrant box add laravel/homestead --force --box-version $HOMESTEAD_BOX_VERSION
    if [ $? -ne 0 ]; then
        >&2 red "Failed to add the laravel/homestead Vagrant box."
        exit 1;
    fi
    blue "Installed laravel/homestead."
else
    blue "laravel/homestead already installed."
fi
echo "\n--------------------"


# Install PHP dependencies.
cd ..
blue "Installing Composer dependencies..."
composer install
if [ $? -ne 0 ]; then
    >&2 red "Composer dependency installation failed."
    exit 1;
fi
blue "Installed Composer dependencies."
echo "\n--------------------"


# Setup .env and run artisan key generation.
blue "Running Artisan key generation..."
cp $SCRIPT_LOCATION/.env.base .env
php artisan key:generate
if [ $? -ne 0 ]; then
    >&2 red "Artisan key generation failed."
    exit 1;
fi
blue "Completed Artisan key generation."
echo "\n--------------------"


# Download Homestead source.
blue "Cloning Homestead source files..."
rm -rf ./Homestead > /dev/null 2>&1
git clone https://github.com/laravel/homestead.git ./Homestead
if [ $? -ne 0 ]; then
    >&2 red "Failed to clone Homestead."
    exit 1;
fi
cd Homestead
git checkout $HOMESTEAD_GIT_RELEASE
blue "Completed Homestead source clone."
echo "\n--------------------"


# Configure Homestead.
cat /dev/zero | ssh-keygen -b 2048 -t rsa -f ./hc_rsa -q -N "" > /dev/null
cp $SCRIPT_LOCATION/hc-dev-homestead-config.yaml ./Homestead.yaml
sed -i '' -e "s^{{ HC.SOURCE_DIRECTORY }}^$CODE_LOCATION^g" ./Homestead.yaml
sed -i '' -e "s^{{ HC.RSA_KEY }}^$CODE_LOCATION/Homestead/hc_rsa^g" ./Homestead.yaml
sed -i '' -e "s^{{ HC.HOMESTEAD_VERSION }}^$HOMESTEAD_VERSION^g" ./Homestead.yaml
cp $SCRIPT_LOCATION/hc-dev-homestead-after.sh after.sh


# Bring the Vagrant box up for the first time.
blue "Launching the Vagrant VM..."
vagrant up
if [ $? -ne 0 ]; then
    >&2 red "Failed to bring the Vagrant box up."
    exit 1;
fi

vagrant ssh -c "cd hackcambridge; php artisan migrate; yarn; yarn prod"
if [ $? -ne 0 ]; then
    >&2 red "Artisan database migration failed. This will need to be done manually."
    >&2 red "Run 'vagrant ssh -c \"cd hackcambridge; php artisan migrate; yarn; yarn prod\"' in the $CODE_LOCATION/Homestead folder."
    exit 1;
fi
blue "Finished launching the Vagrant VM.\n\n"


# Stop the VM and configure its DNS.
vagrant halt
if [ $? -ne 0 ]; then
    >&2 red "Failed to stop the VM. Try re-running 'vagrant halt'."
    exit 1;
fi
VBoxManage modifyvm "homestead" --natdnsproxy1 on
if [ $? -ne 0 ]; then
    >&2 red "Failed to set the VM's DNS proxy setting."
    exit 1;
fi

# Complete.
cd $ORIGINAL_LOCATION;
green "The HC Dev environment is now setup. The VM is currently off."
echo ""
echo "Start the VM with 'cd $CODE_LOCATION/Homestead && vagrant up'"
echo "Stop the VM with 'cd $CODE_LOCATION/Homestead && vagrant halt'"
echo "Remove the VM with 'cd $CODE_LOCATION/Homestead && vagrant destroy'"
echo "Restart/reinstall the VM with 'cd $CODE_LOCATION/Homestead && vagrant up'"
echo ""

cat << EndOfMessage
Next steps:
    1. Add environment secrets to .env.
      This is explained on the 'Development > Setting up the Development Environment' page in Notion.
    2. Start the VM and go to http://local.hackcambridge.com to make sure everything works!


(Legacy) Setup the hackcambridge.test domain:
    1. Add hackcambridge.test to your hosts file.
       Check the file doesn't already contain the record before running the command below.
       Run: sudo sh -c 'echo "192.168.10.10 hackcambridge.test" >> /etc/hosts'
    2. Go to http://hackcambridge.test in your browser to make sure everything works. 
EndOfMessage

echo ""