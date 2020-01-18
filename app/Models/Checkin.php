<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checkin extends Model
{
    public function application() {
        return $this->hasOne('App\Models\Application');
    }
}
