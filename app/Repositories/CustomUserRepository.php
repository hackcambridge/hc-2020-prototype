<?php

namespace App\Repositories;

use App\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\UnauthorizedException;

use Auth0\Login\Auth0User;
use Auth0\Login\Auth0JWTUser;
use Auth0\Login\Repository\Auth0UserRepository;

class CustomUserRepository extends Auth0UserRepository
{

    /**
     * Get an existing user or create a new one
     *
     * @param array $profile - Auth0 profile
     *
     * @return User
     */
    protected function upsertUser($profile)
    {

        // See if we have a user that matches the Auth0 user_id
        $user = User::where('sub', $profile['sub'])->first();

        // In not, add them to the database
        if (!$user) {
            $user = new User();
            $user->setAttribute('sub', $profile['sub']);
            $sub_parts = explode("|", $profile['sub']);
            $type = ($sub_parts[0] == "email") ? "sponsor" :
                (($sub_parts[1] == "MyMLH") ? "hacker" :
                (($sub_parts[0] == "google-apps" && strpos($sub_parts[1], "@hackcambridge.com") !== false)
                    ? "committee" : "unknown"));
            $user->setAttribute('type', $type);
            $user->setAttribute('profile', '{}');

            if($type == 'hacker') {
                throw new UnauthorizedException("Applications have closed");
            }
        }

        if ($user->type == "sponsor" || $user->type == "sponsor-reviewer") {
            $sponsor = DB::table("sponsor_agents")
                ->where("email", "=", $user->email)
                ->join("sponsors", "sponsors.id", "=", "sponsor_agents.sponsor_id")->select("privileges")->first();
            if ($sponsor && strpos($sponsor->privileges, "reviewing")) {
                $user->setAttribute('type', "sponsor-reviewer");
            } else {
                $user->setAttribute('type', "sponsor");
            }
        }

        $user->setAttribute('email', isset($profile['email']) ? $profile['email'] : '');
        $user->setAttribute('name', isset($profile['name']) ? $profile['name'] : '');

        $payload = $this->getAuth0UserInformation($profile['sub']);
        if ($payload) {
            $user->setAttribute('profile', $payload);
        }

        $user->save();
        return $user;
    }

    /**
     * Authenticate a user with a decoded ID Token
     *
     * @param object $jwt
     *
     * @return Auth0JWTUser
     */
    public function getUserByDecodedJWT($jwt)
    {
        $user = $this->upsertUser((array)$jwt);
        return new Auth0JWTUser($user->getAttributes());
    }

    /**
     * Get a User from the database using Auth0 profile information
     *
     * @param array $userinfo
     *
     * @return Auth0User
     */
    public function getUserByUserInfo($userinfo)
    {
        $user = $this->upsertUser($userinfo['profile']);
        return new Auth0User($user->getAttributes(), $userinfo['accessToken']);
    }

    public function getAuth0UserInformation($user_id)
    {
        // We generate a token:
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://hackcambridge.eu.auth0.com/oauth/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);

        $client_id = env('AUTH0_CLIENT_ID');
        $client_secret = env('AUTH0_CLIENT_SECRET');
        $auth_opts = "{\"client_id\":\"" . $client_id . "\",\"client_secret\":\"" . $client_secret . "\",\"audience\":\"https://hackcambridge.eu.auth0.com/api/v2/\",\"grant_type\":\"client_credentials\"}";
        curl_setopt($ch, CURLOPT_POSTFIELDS, $auth_opts);

        $headers = array();
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);

        // TODO: Check if this is present!
        $accessToken = json_decode($result)->access_token;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://hackcambridge.eu.auth0.com/api/v2/users/' . $user_id);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPGET, 1);
        $headers = array();
        $headers[] = 'Content-Type: application/json';
        $headers[] = 'Authorization: Bearer ' . $accessToken;
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            Log::error('Error:' . curl_error($ch));
        }

        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($httpcode != "200") {
            return false;
        } else {
            return $result;
        }
    }
}
