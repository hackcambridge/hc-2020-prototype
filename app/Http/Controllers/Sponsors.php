<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class Sponsors extends Controller
{
    public function dashboard()
    {
        return view('sponsors/dashboard')->with("props", array(
            "baseUrl" => route("sponsors_dashboard", array(), false),
            "user" => array(
                "type" => Auth::user()->type,
                "name" => Auth::user()->name
            ),
        ));
    }
}
