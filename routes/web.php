<?php

use App\User;
use App\Http\Resources\User as UserResource;
use App\Http\Resources\Sponsor as SponsorResource;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

# Auth0
Route::get('/auth0/callback', '\Auth0\Login\Auth0Controller@callback')->name('auth0-callback');
Route::get('/logout', 'Auth\Auth0IndexController@logout')->name('logout')->middleware('auth');
Route::get('/login/{driver?}', 'Auth\Auth0IndexController@login')->name('login');

Route::middleware(['auth.check_staging'])->group(function() {
    Route::get('/', 'Home@index')->name('home');
    Route::get('/foundation', 'Foundation@index')->name('foundation_index');

    // Protected routes - login will be forced.
    Route::middleware(['auth', 'type:hacker'])->group(function () {

        // React App
        Route::get('/dashboard/{path?}', [
            'uses' => 'Dashboard@index',
            'as' => 'dashboard_index',
            'where' => ['path' => '.*']
        ]);

        // Private API
        Route::get('/dashboard-api/{path}.json', 'Dashboard@api_get')->name('dashboard_api_get');
        Route::middleware(['verifyCsrf'])
            ->post('/dashboard-api/{path}.json', 'Dashboard@api_post')
            ->name('dashboard_api_post');
    });


    Route::middleware(['auth.passwordless', 'type:sponsor'])->group(function() {

        // React App
        Route::get('/sponsors/dashboard/{path?}', [
            'uses' => 'Sponsors@dashboard',
            'as' => 'sponsors_dashboard',
            'where' => ['path' => '.*']
        ]);

        // Private API
        Route::get('/sponsors/dashboard-api/{path}.json', 'Sponsors@api_get')->name('sponsors_api_get');
        Route::middleware(['verifyCsrf'])
            ->post('/sponsors/dashboard-api/{path}.json', 'Sponsors@api_post')
            ->name('sponsors_api_post');
    });

    Route::middleware(['auth.committee', 'type:committee'])->group(function() {

        // React App
        Route::get('/committee/admin/{path?}', [
            'uses' => 'Committee@index',
            'as' => 'committee_dashboard',
            'where' => ['path' => '.*']
        ]);

        // Private API
        Route::get('/committee/admin-api/{path}.json', 'Committee@api_get')->name('committee_api_get');
        Route::middleware(['verifyCsrf'])
            ->post('/committee/admin-api/{path}.json', 'Committee@api_post')
            ->name('committee_api_post');
    });
});