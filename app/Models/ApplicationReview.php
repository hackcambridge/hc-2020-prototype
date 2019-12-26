<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationReview extends Model
{
    public function user() {
        return $this->belongsTo('App\User');
    }

    public function application() {
        return $this->belongsTo('App\Models\Application');
    }
}
