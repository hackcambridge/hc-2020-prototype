<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    public function user() {
        return $this->belongsTo('App\User');
    }

    public function reviews() {
        return $this->hasMany('App\Models\ApplicationReview');
    }

    public function checkin() {
        return $this->hasOne('App\Models\Checkin');
    }
}
