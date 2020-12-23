# Hack Cambridge 2020 Platform Prototype

[![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/hackcambridge/hc2020-prototype)](https://lgtm.com/projects/g/hackcambridge/hc2020-prototype/)
[![LGTM Alerts](https://img.shields.io/lgtm/alerts/github/hackcambridge/hc2020-prototype)](https://lgtm.com/projects/g/hackcambridge/hc2020-prototype/)

The `hc2020` platform consists of a Laravel skeleton that provides a static front site and three independant [React](https://reactjs.org/) web apps (the Hackers' dashboard, the Sponsors' dashboard, and the Committee admin dashboard).

The structure of this respository is defined by the [Laravel standard](https://www.w3schools.in/laravel-tutorial/application-directory-structure/). Notable folders are:
* `app/` --- this holds PHP source files for the site. See `app/Http/Controllers` for the controller than build the site's views.
* `database/` --- this defines the migrations that build up the database. Migrations are strictly append only.
* `public/` --- this is the effective root of the site. All files in here are exposed by the web server.
* `resources/` --- this holds the definitions for the React apps, along with any CSS and view definition files.
* `route/web.php` --- this file defines the web app's routable domain and the corresponding controllers.

The React apps use [Shopify Polaris](https://polaris.shopify.com/) as the base UI framework.

### Setup

Follow the instructions on the "Development > Setting Up the Development Environment" page on the Hack Cambridge Notion. Basic usage is as follows.

```bash
git clone git@github.com:hackcambridge/hc2020-prototype.git
./hc2020-prototype/.hackcambridge/hc-dev-install.sh
```

Whenever pulling a new version you recompile the React apps and migrate the database (as shown below).

### Useful Commands

The dev enviornment setup process with create a [Vagrant](https://www.vagrantup.com/)-managed VM configured exactly as required. From the `Homestead/` folder you can run the following.

```bash
vagrant up  # start the Vagrant VM
vagrant halt  # suspend the Vagrant VM
vagrant destroy  # delete the Vagrant VM
vagrant ssh  # ssh into the Vagrant VM
```

Once SSH-ed into the VM (and run `cd hackcambridge`) you can interact with the deployment as follows. 

```bash
yarn  # install all NPM dependencies
yarn dev  # build a testing version of the React apps
yarn watch-poll  # build a testing version of the React apps and incrementally recompile when the files change
php artisan migrate  # build the database from the DB migration definitions
php artisan migrate:fresh  # drop and rebuild the database 
```
