<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    public function user() {
        return $this->hasMany('App\User');
    }

    public function reviews() {
        return $this->hasMany('App\Models\ApplicationReview');
    }
}
