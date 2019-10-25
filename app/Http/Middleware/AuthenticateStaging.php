<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class AuthenticateStaging extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $driver
     * @return string
     */
    protected function redirectTo($request)
    {
        // Force committee auth for all routes if we're in the staging environment.
        if(in_array(config('app.env'), array('staging'))) {
            if (! $request->expectsJson()) {
                return route('login', 'committee');
            }
        } else {
            return $next($request);
        }
    }
}
