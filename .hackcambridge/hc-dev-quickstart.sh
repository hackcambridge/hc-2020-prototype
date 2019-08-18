#!/bin/bash

# Install Homestead Vagrant box.
vagrant box add laravel/homestead
if [ $? -ne 0 ]; then
    echo "Vagrant not installed/configured."
    echo "'vagrant --version' should run correctly."
    return
fi

# Clone the hc2020-prototype source code.
git clone git@github.com:hackcambridge/hc2020-prototype.git
if [ $? -ne 0 ]; then
    echo "Git not installed/configured."
    echo "'git --version' should run correctly."
    return
fi

cd hc2020-prototype
composer install
if [ $? -ne 0 ]; then
    echo "Composer not installed/configured."
    echo "'composer --version' should run correctly."
    return
fi

cp .env.base .env
php artisan key:generate
if [ $? -ne 0 ]; then
    echo "Artisan failiure."
    return
fi

cd ..

git clone https://github.com/laravel/homestead.git ./Homestead
cd Homestead
git checkout release

# Homestead YAML
# https://gist.githubusercontent.com/HarriBellThomas/caef89005e52267006012cc343098267/raw/d492fac4a4fdf3052bf0b23382ad117cc618845d/hc-dev-homestead-config.yaml
curl https://gist.githubusercontent.com/HarriBellThomas/caef89005e52267006012cc343098267/raw/1421d8fd581c893327613fcc52ddb70b070718c5/hc-dev-homestead-config.yaml \
    --output Homestead.yaml

vagrant up
vagrant ssh -c "cd hackcambridge; php artisan migrate"
cd ..
