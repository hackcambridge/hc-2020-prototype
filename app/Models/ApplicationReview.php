<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationReview extends Model
{
    public function user() {
        return $this->hasOne('App\User');
    }

    public function application() {
        return $this->hasOne('App\Models\Application');
    }
}
