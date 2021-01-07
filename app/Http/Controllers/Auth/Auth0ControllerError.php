<?php

namespace App\Http\Controllers\Auth;

use Auth0\SDK\Exception\CoreException;
use Auth0\Login\Auth0Controller;

class Auth0ControllerError extends Auth0Controller
{
    /**
     * Wrap auth0 callback controller and handle exceptions if required
     */
    public function callback()
    {
        try {
            // try calling auth0 parent method
            error_log("Attempting callback...\n", 3, '/tmp/auth0_login_errors.txt');
            return parent::callback();

        } catch (CoreException $exception) {
            $message = $exception->getMessage();

            error_log($message . "\n", 3, '/tmp/auth0_login_errors.txt');

            // if active session exists, then user is already logged-in - no need to throw an error
            if ($message == "Can't initialize a new session while there is one active session already")
                return \Redirect::intended('/');

            // invalid state is often a temporary cookie or a timing problem, and is often resolved by simply logging out
            if ($message == "Invalid state")
                return \Redirect::route('logout');

            }
    }
}
