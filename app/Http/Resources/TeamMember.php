<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TeamMember extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $users = $this->user()->get();
        if(sizeof($users) > 0) $user = $users[0];
        return [
            'user_id' => $this->user_id,
            'user_name' => isset($user) ? $user->name : "(unknown)",
            'user_email_hash' => isset($user) ? md5($user->email) : "",
            'team_id' => $this->team_id,
            'team_owner' => $this->owner,
        ];
    }
}
