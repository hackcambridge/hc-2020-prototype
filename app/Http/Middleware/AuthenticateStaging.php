<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AuthenticateStaging {
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next) {
        if(!Auth::check()) {
            if(in_array(config('app.env'), array('staging'))) {
                if (!$request->expectsJson()) {
                    return redirect()->route('login', ['committee']);
                } else {
                    return response([
                        'success' => false,
                        'message' => 'Unauthorized'
                    ], 401);
                }
            }
        }

        return $next($request);
    }
}