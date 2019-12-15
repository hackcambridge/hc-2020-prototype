<?php
namespace Reviewing;

use App\User;

class ApplicationReviewer {
    public static function review() {
        echo User::all()->count();
    }
}
