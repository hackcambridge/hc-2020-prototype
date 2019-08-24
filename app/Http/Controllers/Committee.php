<?php

namespace App\Http\Controllers;

use App\User;

class Committee extends Controller
{
    public function dashboard()
    {
        return view('committee/dashboard');
    }

    public function users()
    {
        $users = User::all();
        return view('committee/users')->with("users", $users);
    }
}
