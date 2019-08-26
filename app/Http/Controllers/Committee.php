<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Support\Facades\Auth;

class Committee extends Controller
{
    public function index()
    {
        return view('committee/dashboard')->with("props", array(
            "baseUrl" => route("committee_dashboard", array(), false),
            "user" => array(
                "type" => Auth::user()->type,
                "name" => Auth::user()->name
            ),
        ));
    }

    public function users()
    {
        $users = User::all();
        return view('committee/users')->with("users", $users);
    }
}
