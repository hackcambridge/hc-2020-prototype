<?php

namespace App\Repositories;

use App\User;

use Auth0\Login\Auth0User;
use Auth0\Login\Auth0JWTUser;
use Auth0\Login\Repository\Auth0UserRepository;

class CustomUserRepository extends Auth0UserRepository {

    /**
     * Get an existing user or create a new one
     *
     * @param array $profile - Auth0 profile
     *
     * @return User
     */
    protected function upsertUser($profile) {

        // See if we have a user that matches the Auth0 user_id
        $user = User::where('sub', $profile['sub'])->first();

        // In not, add them to the database
        if (!$user) {
            $user = new User();
            $user->setAttribute('email', $profile['email']);
            $user->setAttribute('sub', $profile['sub']);
            $user->setAttribute('name', isset( $profile['name'] ) ? $profile['name'] : '');
//            $user->setAttribute('first_name', isset( $profile['first_name'] ) ? $profile['first_name'] : '');
//            $user->setAttribute('last_name', isset($profile['last_name']) ? $profile['last_name'] : '');
//            $user->setAttribute('level_of_study', isset($profile['level_of_study']) ? $profile['level_of_study'] : '');
//            $user->setAttribute('major', isset($profile['major']) ? $profile['major'] : '');
//            $user->setAttribute('shirt_size', isset($profile['shirt_size']) ? $profile['shirt_size'] : '');
//            $user->setAttribute('dietary_restrictions', isset($profile['dietary_restrictions']) ? $profile['dietary_restrictions'] : '');
//            $user->setAttribute('special_needs', isset($profile['special_needs']) ? $profile['special_needs'] : '');
//            $user->setAttribute('date_of_birth', isset($profile['date_of_birth']) ? $profile['date_of_birth'] : '');
//            $user->setAttribute('gender', isset($profile['gender']) ? $profile['gender'] : '');
//            $user->setAttribute('school', isset($profile['school']) ? $profile['school']['name'] : '');
            $user->save();
        }
        return $user;
    }

    /**
     * Authenticate a user with a decoded ID Token
     *
     * @param object $jwt
     *
     * @return Auth0JWTUser
     */
    public function getUserByDecodedJWT($jwt) {
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
    public function getUserByUserInfo($userinfo) {
        $user = $this->upsertUser($userinfo['profile']);
        return new Auth0User($user->getAttributes(), $userinfo['accessToken']);
    }

}