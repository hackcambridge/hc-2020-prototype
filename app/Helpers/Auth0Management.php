<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class Auth0Management {
    
    private static function verifyAdmin() {
        return (Auth::check() && in_array(Auth::user()->type, ["admin"]));
    }

    private static function getAuth0AccessToken() {
        $auth0_domain = env('AUTH0_DOMAIN', false);
        $auth0_api_audience = env('AUTH0_API_AUDIENCE', false);
        $client_id = env('AUTH0_CLIENT_ID', false);
        $client_secret = env('AUTH0_CLIENT_SECRET', false);
        if(!($client_id && $client_secret && $auth0_domain && $auth0_api_audience)) return false;

        // Generate an Auth0 request token.
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://'. $auth0_domain .'/oauth/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "{\"client_id\":\"". $client_id ."\",\"client_secret\":\"". $client_secret ."\",\"audience\":\"". $auth0_api_audience ."\",\"grant_type\":\"client_credentials\"}");
        $headers = array();
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        $decoded_result = json_decode($result);

        if (curl_errno($ch)) {
            return Auth0Management::respond(false, 'Error: ' . curl_error($ch));
        }
        else if (isset($decoded_result->error)) {
            return Auth0Management::respond(false, 'Error: ' . $decoded_result->error . '. ' . $decoded_result->error_description);
        }
        else if (!isset($decoded_result->access_token)) {
            return Auth0Management::respond(false, 'Error: Access token not present.');
        }
        curl_close($ch);

        $accessToken = json_decode($result)->access_token;
        return Auth0Management::respond(true, $accessToken);
    }

    public static function removePasswordlessUser($user_id) {
        if(!Auth0Management::verifyAdmin()) return Auth0Management::respond(false, "Unauthorised. Login as an admin.");

        // Credential data.
        $auth0_domain = env('AUTH0_DOMAIN', false);
        $auth0_api_audience = env('AUTH0_API_AUDIENCE', false);
        $client_id = env('AUTH0_CLIENT_ID', false);
        $client_secret = env('AUTH0_CLIENT_SECRET', false);
        if(!($client_id && $client_secret && $auth0_domain && $auth0_api_audience)) return false;

        // Get access token.
        $accessTokenRequest = Auth0Management::getAuth0AccessToken();
        if(!$accessTokenRequest["success"]) return $accessTokenRequest;
        $accessToken = $accessTokenRequest["message"];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://'. $auth0_domain .'/api/v2/users/'. $user_id);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
        $headers = array();
        $headers[] = 'Content-Type: application/json';
        $headers[] = 'Authorization: Bearer '. $accessToken;
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        $decoded_result = json_decode($result);

        if (curl_errno($ch)) {
            return Auth0Management::respond(false, 'Error: ' . curl_error($ch));
        }
        else if (isset($decoded_result->error)) {
            return Auth0Management::respond(false, 'Error: ' . $decoded_result->error . ' ('. $decoded_result->statusCode .'). ' . $decoded_result->message);
        }

        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($httpcode >= 200 && $httpcode < 300) {
            return Auth0Management::respond(true, "");
        } else {
            return Auth0Management::respond(false, "Invalid HTTP Response (". $httpcode .").");
        }
    }

    public static function addPasswordlessUser($email, $name){
        if(!Auth0Management::verifyAdmin()) return Auth0Management::respond(false, "Unauthorised. Login as an admin.");

        // Credential data.
        $auth0_domain = env('AUTH0_DOMAIN', false);
        $auth0_api_audience = env('AUTH0_API_AUDIENCE', false);
        $client_id = env('AUTH0_CLIENT_ID', false);
        $client_secret = env('AUTH0_CLIENT_SECRET', false);
        if(!($client_id && $client_secret && $auth0_domain && $auth0_api_audience)) return false;

        // Get access token.
        $accessTokenRequest = Auth0Management::getAuth0AccessToken();
        if(!$accessTokenRequest["success"]) return $accessTokenRequest;
        $accessToken = $accessTokenRequest["message"];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://'. $auth0_domain .'/api/v2/users');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, '{"email":"'.$email.'","user_metadata":{},"blocked":false,"email_verified":true,"app_metadata":{},"name":"'.$name.'","connection":"email","verify_email":false}');
        
        $headers = array();
        $headers[] = 'Content-Type: application/json';
        $headers[] = 'Authorization: Bearer '.$accessToken;
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        $decoded_result = json_decode($result);

        if (curl_errno($ch)) {
            return Auth0Management::respond(false, 'Error: ' . curl_error($ch));
        }
        else if (isset($decoded_result->error)) {
            return Auth0Management::respond(false, 'Error: ' . $decoded_result->error . ' ('. $decoded_result->statusCode .'). ' . $decoded_result->message);
        }
        else if (!isset($decoded_result->user_id)) {
            return Auth0Management::respond(false, 'Error: User ID not present.');
        }

        curl_close($ch);
        return Auth0Management::respond(true, $decoded_result->user_id);
    }

    private static function respond($success, $message="") {
        return array(
            "success" => $success,
            "message" => $message,
        );
    }
}
