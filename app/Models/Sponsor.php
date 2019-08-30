<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    public function agents() {
        return $this->hasMany('App\Models\SponsorAgent');
    }

    public function details() {
        return $this->hasMany('App\Models\SponsorDetail');
    }
}
