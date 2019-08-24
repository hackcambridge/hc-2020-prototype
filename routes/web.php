<?php

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

Route::get('/', 'Home@index')->name('home');
Route::get('/foundation', 'Foundation@index')->name('foundation_index');

// Protected routes - login will be forced.
Route::middleware(['auth', 'type:hacker'])->group(function () {
    Route::get('/dashboard', 'Dashboard@index')->name('dashboard_index');
});


Route::middleware(['auth.passwordless', 'type:sponsor'])->group(function() {
    Route::get('/sponsors/dashboard', 'Sponsors@dashboard')->name('sponsors_dashboard');
});

Route::middleware(['auth.committee', 'type:committee'])->group(function() {
    Route::get('/committee/admin', 'Committee@dashboard')->name('committee_dashboard');
    Route::get('/committee/admin/users', 'Committee@users')->name('admin_users');
});

# Auth0
Route::get('/auth0/callback', '\Auth0\Login\Auth0Controller@callback')->name('auth0-callback');
Route::get('/logout', 'Auth\Auth0IndexController@logout')->name('logout')->middleware('auth');
Route::get('/login/{driver?}', 'Auth\Auth0IndexController@login')->name('login');

