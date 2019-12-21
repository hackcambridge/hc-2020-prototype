<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Blade;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            \Auth0\Login\Contract\Auth0UserRepository::class,
        	\App\Repositories\CustomUserRepository::class
        );
        $this->app->bind('mailgun.client', function() {
            return \Http\Adapter\Guzzle6\Client::createWithConfig([
                // your Guzzle6 configuration
            ]);
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if(in_array(config('app.env'), array('production', 'staging'))) {
            \URL::forceScheme('https');
        }
        Schema::defaultStringLength(191);

        Blade::if('env', function ($environment) {
            return app()->environment($environment);
        });
    }
}
