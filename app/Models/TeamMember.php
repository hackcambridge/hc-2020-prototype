<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    public function user() {
        return $this->hasMany('App\User');
    }
}
