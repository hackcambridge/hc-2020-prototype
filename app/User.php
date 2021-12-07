<?php

namespace App;

use App\Models\Application;
use App\Models\ApplicationReview;
use App\Models\Checkin;
use App\Models\TeamMember;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'sub'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function team() {
        return $this->hasOne(TeamMember::class);
    }

    public function reviews() {
        return $this->hasMany(ApplicationReview::class);
    }

    public function application() {
        return $this->hasOne(Application::class);
    }

    public function checkIn() {
        return $this->hasOneThrough(Checkin::class, Application::class);
    }

    // DONE (@Theo pls check) TODO Implement eloquent relationships back to TeamMember; ApplicationReview; Application; Checkin
}
